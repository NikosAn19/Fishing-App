import { MatrixClient, Room, Visibility, Preset, EventTimeline } from 'matrix-js-sdk';

export class MatrixRoomManager {
  private getClient: () => MatrixClient | null;

  constructor(getClient: () => MatrixClient | null) {
    this.getClient = getClient;
  }

  public getRooms(): Room[] {
    const client = this.getClient();
    if (!client) return [];
    return client.getRooms();
  }

  public getRoom(roomId: string): Room | null {
    const client = this.getClient();
    if (!client) return null;
    return client.getRoom(roomId);
  }

  /**
   * Joins a room by ID or Alias.
   */
  public async joinRoom(roomIdOrAlias: string): Promise<Room | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const room = await client.joinRoom(roomIdOrAlias);
      return room;
    } catch (error) {
      console.error(`❌ MatrixRoomManager: Failed to join room ${roomIdOrAlias}`, error);
      return null;
    }
  }

  /**
   * Creates a room directly from the frontend.
   */
  public async createRoom(name: string, isPrivate: boolean = true, alias?: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const options: any = {
        name,
        visibility: isPrivate ? Visibility.Private : Visibility.Public,
      };
      if (alias) {
        options.room_alias_name = alias;
      }

      const response = await client.createRoom(options);
      return response.room_id;
    } catch (error) {
      console.error('❌ MatrixRoomManager: Failed to create room', error);
      return null;
    }
  }

  /**
   * Creates a Direct Message (1:1) chat with a user.
   */
  public async createDirectChat(userId: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      // 1. Check for existing DM (Deduplication)
      const directEvent = client.getAccountData('m.direct' as any);
      const directContent = directEvent ? directEvent.getContent() : {};
      const existingRoomIds = directContent[userId] || [];

      if (Array.isArray(existingRoomIds)) {
          for (const roomId of existingRoomIds) {
              const room = client.getRoom(roomId);
              if (room) {
                  const myMembership = room.getMyMembership();
                  // Re-use if we are joined or invited (waiting to join)
                  if (myMembership === 'join' || myMembership === 'invite') {
                      console.log(`found existing DM with ${userId}: ${roomId}`);
                      return roomId;
                  }
              }
          }
      }

      console.log(`💬 Creating new DM with ${userId}...`);
      const response = await client.createRoom({
        preset: Preset.TrustedPrivateChat,
        invite: [userId],
        is_direct: true,
      });
      console.log(`✅ DM Created: ${response.room_id}`);

      // CRITICAL FIX: Manually update m.direct account data immediately
      // This ensures the next "Deduplication" check finds this room, preventing duplicates.
      const currentDirectEvent = client.getAccountData('m.direct' as any);
      const currentContent = currentDirectEvent ? currentDirectEvent.getContent() : {};
      
      const newContent = { ...currentContent };
      const userRooms = newContent[userId] || [];
      
      if (!userRooms.includes(response.room_id)) {
          newContent[userId] = [...userRooms, response.room_id];
          await client.setAccountData('m.direct' as any, newContent);
          console.log(`✅ Updated m.direct for ${userId}:`, newContent[userId]);
      }

      return response.room_id;
    } catch (error) {
      console.error('❌ MatrixRoomManager: Failed to create DM', error);
      return null;
    }
  }


  /**
   * Leaves a room and forgets it (removes from list/sync).
   */
  public async leaveRoom(roomId: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
        console.log(`🚪 MatrixRoomManager: Leaving room ${roomId}...`);
        
        // 1. Check if it's in m.direct before leaving, so we know if we need to clean it
        // (Though we can just always try to clean it to be safe)
        
        await client.leave(roomId);
        console.log(`✅ Left room. Forgetting...`);
        
        try {
            await client.forget(roomId);
        } catch (e) {
            console.warn(`⚠️ Failed to forget room ${roomId} (might already be forgotten)`, e);
        }
        
        // 2. Remove from m.direct (CRITICAL for DM Persistence Bug)
        try {
            const currentDirect = client.getAccountData('m.direct' as any);
            const content = currentDirect ? currentDirect.getContent() : {};
            let changed = false;
            
            const newContent = { ...content }; // Clone

            for (const userId in newContent) {
                const rooms = newContent[userId];
                if (Array.isArray(rooms) && rooms.includes(roomId)) {
                    newContent[userId] = rooms.filter((r: unknown) => r !== roomId);
                    
                    // Cleanup empty user entries
                    if (newContent[userId].length === 0) {
                        delete newContent[userId];
                    }
                    
                    changed = true;
                }
            }
            
            if (changed) {
                await client.setAccountData('m.direct' as any, newContent);
                console.log(`✅ Removed from m.direct account data`);
            }
        } catch (e) {
            console.warn('⚠️ Failed to clean m.direct map', e);
        }

        return true;
    } catch (error) {
        console.error(`❌ MatrixRoomManager: Failed to leave room ${roomId}`, error);
        return false;
    }
  }

  /**
   * Joins or opens a chat based on the identifier format.
   * - Starts with '!': Joins existing room by ID.
   * - Starts with '#': Joins public room by alias, or creates it if missing.
   * - Otherwise: Treats as User ID and creates/opens Direct Chat.
   */
  public async joinOrOpenChat(identifier: string): Promise<string | null> {
    // 1. Existing Room ID
    if (identifier.startsWith('!')) {
        console.log('✅ MatrixRoomManager: Opening existing room:', identifier);
        const room = await this.joinRoom(identifier);
        return room ? room.roomId : null;
    }

    // 2. Room Alias (Public Channel)
    if (identifier.startsWith('#')) {
        console.log('🔄 MatrixRoomManager: Joining public room:', identifier);
        let room = await this.joinRoom(identifier);
        
        if (!room) {
            console.log('⚠️ MatrixRoomManager: Room not found, attempting to create:', identifier);
            // Extract alias localpart (e.g. #alias:server -> alias)
            const aliasLocalpart = identifier.split(':')[0].substring(1);
            const roomId = await this.createRoom(aliasLocalpart, false, aliasLocalpart);
            if (roomId) {
                console.log('✅ MatrixRoomManager: Created public room:', roomId);
                return roomId;
            }
        }
        return room ? room.roomId : null;
    }

    // 3. User ID (Direct Chat)
    console.log('💬 MatrixRoomManager: Treating as User ID for DM:', identifier);
    return this.createDirectChat(identifier);
  }

  /**
   * Returns all joined rooms sorted by last activity (most recent first).
   */
  public getSortedRooms(): Room[] {
    const client = this.getClient();
    if (!client) return [];

    const rooms = client.getVisibleRooms();
    
    return rooms.sort((a, b) => {
      const lastEventA = a.getLastActiveTimestamp();
      const lastEventB = b.getLastActiveTimestamp();
      return lastEventB - lastEventA;
    });
  }

  /**
   * Checks if a room is a Direct Message (1:1 chat).
   * This is a heuristic based on membership count or room type.
   */
  public isDirectChat(room: Room): boolean {
    // 0. Use global account data (The Correct Way)
    const client = this.getClient();
    if (client) {
        const directEvent = client.getAccountData('m.direct' as any);
        const directContent = directEvent ? directEvent.getContent() : {};
        const isDirectInAccountData = Object.values(directContent).some((roomIds: any) => 
            Array.isArray(roomIds) && roomIds.includes(room.roomId)
        );
        if (isDirectInAccountData) return true;
    }

    // 1. If it's public, it's definitely a channel
    const joinRule = room.getJoinRule();
    if (joinRule === 'public') {
        return false;
    }

    // 2. Fallback to member count for private rooms
    const members = room.getJoinedMembers();
    
    // Allow for invites (1 joined member = me)
    if (members.length === 1 || members.length === 2) {
         // Check total active members including invites
         // Safely access members from live timeline state
         const stateMembers = room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.members || {};
         const activeMembers = Object.values(stateMembers).filter(m => 
            m.membership === 'join' || m.membership === 'invite'
         );
         return activeMembers.length === 2;
    }
    
    return members.length === 2;
  }
}
