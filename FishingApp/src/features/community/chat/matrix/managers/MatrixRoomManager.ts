import { MatrixClient, Room, Visibility } from 'matrix-js-sdk';

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
