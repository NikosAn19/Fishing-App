import { MatrixClient } from './MatrixClient';

interface CreateRoomResponse {
  room_id: string;
}

interface CreateRoomRequest {
  preset?: 'private_chat' | 'public_chat' | 'trusted_private_chat';
  visibility?: 'private' | 'public';
  invite?: string[];
  is_direct?: boolean;
  name?: string;
  topic?: string;
  initial_state?: Array<{
    type: string;
    state_key: string;
    content: any;
  }>;
}

export class MatrixRoomService {
  private client: MatrixClient;

  constructor() {
    this.client = MatrixClient.getInstance();
  }

  /**
   * Creates a private Direct Message (DM) room between two users.
   * @param creatorUserId The Matrix ID of the user creating the room (e.g. @userA:server)
   * @param targetUserId The Matrix ID of the user to be invited (e.g. @userB:server)
   * @returns The Room ID (e.g. !abcde:server) or null if failed
   */
  public async createDirectRoom(creatorUserId: string, targetUserId: string): Promise<string | null> {
    try {
      console.log(`🔄 Creating DM room between ${creatorUserId} and ${targetUserId}`);

      const requestBody: CreateRoomRequest = {
        preset: 'private_chat',
        visibility: 'private',
        invite: [creatorUserId, targetUserId],
        is_direct: true,
        initial_state: [
          {
            type: 'm.room.guest_access',
            state_key: '',
            content: { guest_access: 'forbidden' },
          },
        ],
      };

      const response = await this.client.request<CreateRoomResponse>(
        'POST',
        '/_matrix/client/r0/createRoom',
        requestBody
      );

      const roomId = response.room_id;
      console.log(`✅ Room Created: ${roomId}`);

      // Optional: Make the users admins of their own room so they can invite others or change settings
      // This would require extra API calls to set power levels.

      return roomId;
    } catch (error) {
      console.error('❌ Failed to create DM room:', error);
      return null;
    }
  }

  /**
   * Joins a user to a specific room.
   * Useful for auto-joining users to public channels.
   */
  public async joinUserToRoom(userId: string, roomId: string): Promise<boolean> {
    try {
      // Use Synapse Admin API to force join
      await this.client.request(
        'POST',
        `/_synapse/admin/v1/join/${roomId}`,
        {
          user_id: userId,
        }
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to join user ${userId} to room ${roomId}:`, error);
      return false;
    }
  }
  /**
   * Creates a public channel (room).
   * @param creatorUserId The Matrix ID of the user creating the room
   * @param name The name of the channel
   * @param topic Optional topic for the channel
   * @returns The Room ID or null if failed
   */
  public async createPublicRoom(creatorUserId: string, name: string, topic?: string): Promise<string | null> {
    try {
      console.log(`🔄 Creating Public Room: ${name} by ${creatorUserId}`);

      const requestBody: CreateRoomRequest = {
        preset: 'public_chat',
        visibility: 'public',
        name: name,
        topic: topic,
        initial_state: [
          {
            type: 'm.room.guest_access',
            state_key: '',
            content: { guest_access: 'can_join' },
          },
          {
            type: 'm.room.history_visibility',
            state_key: '',
            content: { history_visibility: 'world_readable' },
          }
        ],
      };

      const response = await this.client.request<CreateRoomResponse>(
        'POST',
        '/_matrix/client/r0/createRoom',
        requestBody
      );

      const roomId = response.room_id;
      console.log(`✅ Public Room Created: ${roomId}`);

      // Make the creator admin? Usually creator is admin by default in Matrix.
      
      return roomId;
    } catch (error) {
      console.error('❌ Failed to create public room:', error);
      return null;
    }
  }
  /**
   * Deletes a room using the Synapse Admin API.
   * This removes it from the server database.
   */
  public async deleteRoom(roomId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting Room: ${roomId}`);
      await this.client.request(
        'DELETE',
        `/_synapse/admin/v1/rooms/${roomId}`,
        { purge: true }
      );
      console.log(`✅ Room Deleted: ${roomId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete room ${roomId}:`, error);
      return false;
    }
  }

  /**
   * Updates room name and topic.
   */
  public async updateRoom(roomId: string, userId: string, name?: string, topic?: string): Promise<boolean> {
    try {
      console.log(`🔄 Updating Room: ${roomId}`);
      
      // We need to use the user's access token or the admin client acting as the user?
      // For simplicity, we'll use the admin client (app service bot) if possible, 
      // or we might need to impersonate. 
      // The MatrixClient class uses the admin token.
      
      if (name) {
        await this.client.request(
            'PUT',
            `/_matrix/client/r0/rooms/${roomId}/state/m.room.name`,
            { name }
        );
      }

      if (topic !== undefined) {
        await this.client.request(
            'PUT',
            `/_matrix/client/r0/rooms/${roomId}/state/m.room.topic`,
            { topic }
        );
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to update room ${roomId}:`, error);
      return false;
    }
  }

  /**
   * Invites a user to a room.
   */
  public async inviteUser(roomId: string, userId: string): Promise<boolean> {
    try {
      console.log(`📩 Inviting ${userId} to ${roomId}`);
      await this.client.request(
        'POST',
        `/_matrix/client/r0/rooms/${roomId}/invite`,
        { user_id: userId }
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to invite ${userId} to ${roomId}:`, error);
      return false;
    }
  }
}
