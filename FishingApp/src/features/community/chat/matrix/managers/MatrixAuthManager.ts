import { createClient, MatrixClient } from 'matrix-js-sdk';
import { logger } from 'matrix-js-sdk/lib/logger';
import { API_BASE } from '../../../../../config/api';

export class MatrixAuthManager {
  private client: MatrixClient | null = null;
  private baseUrl: string;

  constructor() {
    // Derive Matrix URL from the centralized API_BASE
    // This ensures we use the same IP/Host as the main API (handling Android localhost etc.)
    try {
      // Remove protocol and port to get the hostname
      const url = new URL(API_BASE);
      const host = url.hostname;
      // Matrix is always on port 8008 for now
      this.baseUrl = `http://${host}:8008`;
      console.log('🔌 MatrixAuthManager: Configured with baseUrl:', this.baseUrl);
    } catch (e) {
      console.warn('⚠️ MatrixAuthManager: Could not parse API_BASE, falling back to default');
      this.baseUrl = 'http://192.168.2.4:8008';
    }
    
    // Silence Matrix SDK logs
    (logger as any).setLevel((logger as any).levels.WARN);
  }

  public getClient(): MatrixClient | null {
    return this.client;
  }

  public isClientReady(): boolean {
    return this.client !== null;
  }

  public getUserId(): string | null {
    return this.client ? this.client.getUserId() : null;
  }


  /**
   * Initializes the client with an existing access token.
   * This avoids hitting the login endpoint and rate limits.
   */
  public async initSession(userId: string, accessToken: string, deviceId?: string): Promise<boolean> {
    try {
      console.log('🔄 MatrixAuthManager: Initializing with existing token...');
      this.client = createClient({
        baseUrl: this.baseUrl,
        userId: userId,
        accessToken: accessToken,
        deviceId: deviceId,
      });

      await this.client.startClient({ initialSyncLimit: 10 });
      console.log('✅ MatrixAuthManager: Session restored successfully');
      return true;
    } catch (error) {
      console.error('❌ MatrixAuthManager: Failed to restore session', error);
      this.client = null;
      return false;
    }
  }

  /**
   * Logs in to Matrix using credentials provided by the backend.
   * @returns The login response containing access token and device ID
   */
  public async login(userId: string, password: string, deviceId?: string): Promise<{ accessToken: string; deviceId: string } | null> {
    try {
      console.log('🔄 MatrixAuthManager: Logging in with password...');
      
      // 1. Create a temporary client to perform login
      const tempClient = createClient({
        baseUrl: this.baseUrl,
        userId: userId,
        deviceId: deviceId,
      });

      // 2. Perform Login to get Access Token
      const loginResponse = await tempClient.login('m.login.password', {
        user: userId,
        password: password,
      });

      console.log('✅ MatrixAuthManager: Login successful, obtained token');

      // 3. Re-create the main client with the access token
      // This ensures the client is fully authenticated for all subsequent requests
      this.client = createClient({
        baseUrl: this.baseUrl,
        userId: userId,
        accessToken: loginResponse.access_token,
        deviceId: loginResponse.device_id,
      });

      // 4. Start the client to begin syncing
      await this.client.startClient({ initialSyncLimit: 10 });
      
      return {
        accessToken: loginResponse.access_token,
        deviceId: loginResponse.device_id,
      };
    } catch (error) {
      console.error('❌ MatrixAuthManager: Login failed', error);
      this.client = null;
      return null;
    }
  }
  public logout(): void {
    if (this.client) {
      this.client.stopClient();
      this.client = null;
    }
  }

  /**
   * Sets the display name for the current user.
   */
  public async setDisplayName(name: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      await client.setDisplayName(name);
      console.log('✅ MatrixAuthManager: Display name updated to', name);
    } catch (error) {
      console.error('❌ MatrixAuthManager: Failed to set display name', error);
    }
  }

  /**
   * Sets the avatar URL for the current user.
   * Note: This typically requires an MXC URI (mxc://...).
   * If an HTTP URL is provided, we might need to upload it first.
   */
  public async setAvatarUrl(url: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      // If it's already an MXC URI, set it directly
      if (url.startsWith('mxc://')) {
          await client.setAvatarUrl(url);
          console.log('✅ MatrixAuthManager: Avatar updated (MXC)');
          return;
      }

      // If it's an HTTP URL, we ideally need to download and upload it to Matrix
      // For now, we'll try setting it directly, but it might not work on all clients
      // TODO: Implement download & upload flow for external URLs
      console.warn('⚠️ MatrixAuthManager: External avatar URLs might not display correctly in all clients. Uploading to Matrix is recommended.');
      
      // Attempt to upload if it's a remote URL? 
      // That requires fetching the blob, which might have CORS issues in browser, but OK in RN.
      // For this iteration, we'll skip the complex upload and just log.
      
    } catch (error) {
      console.error('❌ MatrixAuthManager: Failed to set avatar', error);
    }
  }
}
