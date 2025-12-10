import { MatrixAuthManager } from './managers/MatrixAuthManager';
import { MatrixRoomManager } from './managers/MatrixRoomManager';

class MatrixService {
  private static instance: MatrixService;
  
  public auth: MatrixAuthManager;
  public rooms: MatrixRoomManager;

  private constructor() {
    this.auth = new MatrixAuthManager();
    
    // Pass the client getter to sub-managers so they always access the current client instance
    const getClient = () => this.auth.getClient();
    
    this.rooms = new MatrixRoomManager(getClient);
  }

  public static getInstance(): MatrixService {
    if (!MatrixService.instance) {
      MatrixService.instance = new MatrixService();
    }
    return MatrixService.instance;
  }

  public async getUserProfile(userId: string): Promise<{ displayname?: string; avatar_url?: string } | null> {
      const client = this.auth.getClient();
      if (!client) return null;
      try {
          return await client.getProfileInfo(userId);
      } catch (e) {
          console.warn(`MatrixService: Failed to get profile for ${userId}`, e);
          return null;
      }
  }

  public getHttpUrl(mxcUrl: string, width?: number, height?: number, resizeMethod?: string): string | null {
      const client = this.auth.getClient();
      if (!client || !mxcUrl) return null;

      if (mxcUrl.startsWith('mxc://')) {
          const mediaId = mxcUrl.split('/').pop();
          const serverName = mxcUrl.split('/')[2];
          const accessToken = client.getAccessToken();
          const baseUrl = client.baseUrl;
          
          return `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
      }
      
      return null;
  }
}

export const matrixService = MatrixService.getInstance();
