import { MatrixClient } from './MatrixClient';

interface MatrixUserResponse {
  name: string;
  admin: boolean;
}

export class MatrixUserService {
  private client: MatrixClient;

  constructor() {
    this.client = MatrixClient.getInstance();
  }

  /**
   * Creates a new user on the Matrix server using the Synapse Admin API.
   * @param username The desired username (localpart)
   * @param password The password for the new user
   * @param isAdmin Whether the user should be an admin (default: false)
   * @returns The full Matrix User ID (e.g., @username:server) or null if failed
   */
  public async createMatrixUser(username: string, password: string, isAdmin: boolean = false): Promise<string | null> {
    const serverName = this.client.getServerName();
    const fullUserId = `@${username}:${serverName}`;

    try {
      console.log(`🔄 Creating Matrix user: ${fullUserId} (Admin: ${isAdmin})`);
      
      const response = await this.client.request<MatrixUserResponse>(
        'PUT',
        `/_synapse/admin/v2/users/${fullUserId}`,
        {
          password: password,
          displayname: username,
          admin: isAdmin,
          deactivated: false,
        }
      );

      console.log(`✅ Matrix User Created: ${response.name}`);
      return response.name;
    } catch (error) {
      console.error(`❌ Failed to create Matrix user ${username}:`, error);
      return null;
    }
  }

  /**
   * Updates the display name and avatar of a Matrix user.
   * This ensures the Matrix profile matches the App profile.
   */
  public async updateUserProfile(userId: string, displayName?: string, avatarUrl?: string): Promise<boolean> {
    try {
      if (displayName) {
        await this.client.request('PUT', `/_matrix/client/r0/profile/${userId}/displayname`, {
          displayname: displayName,
        });
      }
      
      if (avatarUrl) {
        await this.client.request('PUT', `/_matrix/client/r0/profile/${userId}/avatar_url`, {
          avatar_url: avatarUrl,
        });
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to update profile for ${userId}:`, error);
      return false;
    }
  }
}
