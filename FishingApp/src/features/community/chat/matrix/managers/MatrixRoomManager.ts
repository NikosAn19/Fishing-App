import { MatrixClient, Room, Visibility, Preset } from 'matrix-js-sdk';

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
      console.log(`💬 Creating DM with ${userId}...`);
      const response = await client.createRoom({
        preset: Preset.TrustedPrivateChat,
        invite: [userId],
        is_direct: true,
      });
      console.log(`✅ DM Created: ${response.room_id}`);
      return response.room_id;
    } catch (error) {
      console.error('❌ MatrixRoomManager: Failed to create DM', error);
      return null;
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
    // Check if it's marked as a direct chat in account data (m.direct)
    // For now, a simple heuristic: 2 members implies DM, >2 implies group/channel
    // Better: Check m.room.member events or room state
    
    // 1. If it's public, it's definitely a channel
    const joinRule = room.getJoinRule();
    if (joinRule === 'public') {
        return false;
    }

    // 2. Fallback to member count for private rooms
    const members = room.getJoinedMembers();
    return members.length === 2;
  }
}
