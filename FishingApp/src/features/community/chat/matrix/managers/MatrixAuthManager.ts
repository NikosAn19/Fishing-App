import { createClient, MatrixClient, ClientEvent, SyncState, Filter } from 'matrix-js-sdk';
import { logger } from 'matrix-js-sdk/lib/logger';
import { API_BASE, DEV_MACHINE_IP } from '../../../../../config/api';
import { CHAT_FILTER_DEFINITION, MATRIX_CONSTANTS } from '../MatrixConfig';

export class MatrixAuthManager {
  private client: MatrixClient | null = null;
  private baseUrl: string;

  constructor() {
    // Derive Matrix URL from the centralized API_BASE
    // This ensures we use the same IP/Host as the main API (handling Android localhost etc.)
    try {
      // Check if we are using a tunnel or HTTPS (production/ngrok)
      // In these cases, we usually want to use the base URL as is
      if (API_BASE.includes('ngrok') || API_BASE.startsWith('https://')) {
          this.baseUrl = API_BASE;
          // Remove trailing slash if present
          if (this.baseUrl.endsWith('/')) {
              this.baseUrl = this.baseUrl.slice(0, -1);
          }
      } else {
          // Local development: Matrix is typically on port 8008
          // Remove protocol and port to get the hostname
          const url = new URL(API_BASE);
          const host = url.hostname;
          this.baseUrl = `http://${host}:8008`;
      }
      
      console.log('🔌 MatrixAuthManager: Configured with baseUrl:', this.baseUrl);
    } catch (e) {
      console.warn('⚠️ MatrixAuthManager: Could not parse API_BASE, falling back to default');
      this.baseUrl = `http://${DEV_MACHINE_IP}:8008`;
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
   * Creates a filter to only fetch messages and essential state events.
   * This optimizes bandwidth and processing by ignoring irrelevant events.
   */
  public createFilter(userId: string): Filter {
      const filter = new Filter(userId);
      filter.setDefinition(CHAT_FILTER_DEFINITION);
      return filter;
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

      // Wait for sync to be PREPARED (type-safe with SyncState enum)
      const syncPromise = new Promise<void>((resolve, reject) => {
        this.client!.once(ClientEvent.Sync, (state: SyncState, prevState: SyncState | null) => {
          console.log(`🔄 MatrixAuthManager: Sync state changed from ${prevState} to ${state}`);
          
          if (state === SyncState.Prepared) {
            console.log('✅ MatrixAuthManager: Sync PREPARED - client ready');
            resolve();
          } else if (state === SyncState.Error) {
            console.error('❌ MatrixAuthManager: Sync ERROR');
            reject(new Error('Sync failed'));
          }
        });
      });

      // Create and apply filter for efficient syncing
      const filter = this.createFilter(userId);

      await this.client.startClient({ 
          initialSyncLimit: MATRIX_CONSTANTS.BATCH_SIZE, // Match filter limit
          filter: filter 
      });
      await syncPromise;  // Wait for PREPARED state
      
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

      // Create and apply filter for efficient syncing
      const filter = this.createFilter(userId);

      // 4. Start the client to begin syncing
      await this.client.startClient({ 
          initialSyncLimit: MATRIX_CONSTANTS.BATCH_SIZE,
          filter: filter
      });
      
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

      // If it's an HTTP URL, download and upload it to Matrix
      if (url.startsWith('http')) {
          console.log(`🔄 MatrixAuthManager: Downloading avatar from external URL: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            console.error(`❌ MatrixAuthManager: Failed to download avatar. Status: ${response.status}`);
            return;
          }
          let blob = await response.blob();
          console.log(`🔄 MatrixAuthManager: Downloaded blob size: ${blob.size}, type: ${blob.type}`);
          
          // Fix missing MIME type
          if (!blob.type) {
              const ext = url.split('.').pop()?.toLowerCase();
              let mimeType = 'application/octet-stream';
              if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
              else if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              
              console.log(`⚠️ MatrixAuthManager: Blob has no type, forcing ${mimeType}`);
              blob = new Blob([blob], { type: mimeType });
          }
          
          console.log('🔄 MatrixAuthManager: Uploading avatar to Matrix...');
          const uploadResponse = await client.uploadContent(blob);
          console.log('✅ MatrixAuthManager: Upload response:', JSON.stringify(uploadResponse));
          
          if (uploadResponse && uploadResponse.content_uri) {
              await client.setAvatarUrl(uploadResponse.content_uri);
              console.log(`✅ MatrixAuthManager: Avatar set to: ${uploadResponse.content_uri}`);
              return;
          } else {
            console.error('❌ MatrixAuthManager: Upload response missing content_uri');
          }
      }
      
      console.warn('⚠️ MatrixAuthManager: Could not set avatar, URL format not supported or upload failed');
    } catch (error) {
      console.error('❌ MatrixAuthManager: Failed to set avatar', error);
    }
  }
}
