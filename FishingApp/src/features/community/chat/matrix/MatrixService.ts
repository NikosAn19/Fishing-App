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

          // If width/height are provided, we could use the thumbnail endpoint, 
          // but for now let's stick to the download endpoint as requested/verified in EventMapper
          // or we can try to support both if needed. 
          // The user specifically pointed to EventMapper which uses /download.
          // However, for avatars, thumbnails are usually better.
          // But if /thumbnail is failing 404, maybe /download works better with auth?
          // Let's use /download as per EventMapper reference to be safe and fix the 404.
          
          return `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
      }
      
      return null;
  }
}

export const matrixService = MatrixService.getInstance();
