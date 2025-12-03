import { MatrixEvent, MsgType, MatrixClient, EventType } from 'matrix-js-sdk';
import { Message } from '../../types/chatTypes';

export class EventMapper {
  /**
   * Maps a MatrixEvent to our internal Message interface.
   * Returns null if the event is not a valid message we can display.
   */
  public static fromMatrixEvent(event: MatrixEvent, client?: MatrixClient | null): Message | null {
    // We only care about room messages
    if (event.getType() !== EventType.RoomMessage) {
      return null;
    }

    const content = event.getContent();
    if (!content || !content.body) {
      return null;
    }

    // Basic fields
    const id = event.getId() || `local-${Date.now()}`;
    const senderId = event.getSender() || 'unknown';
    const timestamp = new Date(event.getTs()).toISOString();
    
    // Try to get sender name (display name)
    const senderName = event.sender?.name || senderId;
    
    // Get avatar and convert to HTTP if client is available
    let senderAvatar = event.sender?.getMxcAvatarUrl ? event.sender.getMxcAvatarUrl() : undefined;
    
    // FIX: Always try to get the latest avatar from the user object in the client.
    // This ensures we show the current profile picture for everyone, not just what's in the event history.
    if (client) {
        const user = client.getUser(senderId);
        if (user?.avatarUrl) {
            // console.log(`[EventMapper] Using latest avatar for ${senderName}: ${user.avatarUrl}`);
            senderAvatar = user.avatarUrl;
        }
    }

    if (senderAvatar) {
        // console.log(`[EventMapper] Found MXC avatar for ${senderName}: ${senderAvatar}`);
        if (client) {
            // Use authenticated media endpoint (MSC3916)
            // We use the query param method for compatibility with React Native Image component
            if (senderAvatar.startsWith('mxc://')) {
                const mediaId = senderAvatar.split('/').pop();
                const serverName = senderAvatar.split('/')[2];
                const accessToken = client.getAccessToken();
                
                // Construct the authenticated URL manually
                // Note: We use the proxy path /_matrix/client/v1/media/download
                // The base URL is handled by the app's configuration, so we just return the full path if possible
                // But client.mxcUrlToHttp usually returns a full URL. 
                // Let's try to use the client's baseUrl if available, or relative path.
                
                const baseUrl = client.baseUrl; // e.g. http://localhost:8008 or via proxy
                senderAvatar = `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
                
                // console.log(`[EventMapper] Converted to authenticated URL: ${senderAvatar}`);
            }
        } else {
            console.warn(`[EventMapper] No client available to convert avatar for ${senderName}`);
        }
    } else {
        // Debug why avatar is missing
        if (!event.sender) {
             console.log(`[EventMapper] Event ${event.getId()} has no sender object (senderId: ${senderId})`);
        } else if (!event.sender.getMxcAvatarUrl()) {
             // This is normal for users without avatars, but good to verify
             // console.log(`[EventMapper] User ${senderName} has no avatar set`);
        }
    }

    const message: Message = {
      id,
      text: content.body,
      senderId,
      senderName,
      senderAvatar: senderAvatar || undefined,
      timestamp,
      isSystem: false,
    };

    // Handle different message types
    if (content.msgtype === MsgType.Image) {
      if (content.url) {
          let imageUrl = content.url;
          if (client) {
              imageUrl = client.mxcUrlToHttp(imageUrl) || imageUrl;
          }
          message.imageUrl = imageUrl; 
      }
    }

    return message;
  }
}
