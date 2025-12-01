import { MatrixEvent, MsgType } from 'matrix-js-sdk';
import { Message } from '../../types/chatTypes';

export class EventMapper {
  /**
   * Maps a MatrixEvent to our internal Message interface.
   * Returns null if the event is not a valid message we can display.
   */
  public static fromMatrixEvent(event: MatrixEvent): Message | null {
    // We only care about room messages
    if (event.getType() !== 'm.room.message') {
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
    // Note: In a real app, you might want to look up the user profile from a store
    // For now, we'll use the sender ID or a fallback
    const senderName = event.sender?.name || senderId;
    const senderAvatar = event.sender?.getMxcAvatarUrl ? event.sender.getMxcAvatarUrl() : undefined;

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
      // If it's an image, we might want to set the imageUrl
      // For now, we'll just show the body text (usually the filename) 
      // or we could add an imageUrl field to Message if we support it
      if (content.url) {
          // We would need to convert MXC URL to HTTP URL here using the client
          // But EventMapper is static/pure. 
          // We'll leave it as is for now or pass a URL converter if needed.
          message.imageUrl = content.url; 
      }
    }

    return message;
  }
}
