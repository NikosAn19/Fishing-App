import { NotificationStrategy } from './NotificationStrategy';
import { NotificationContent } from '../types/NotificationTypes';
import { Message } from '../../community/chat/domain/entities/Message';

interface ChatPayload {
  roomId: string;
  message: Message;
  senderName?: string;
}

export class ChatMessageStrategy implements NotificationStrategy<ChatPayload> {
  getContent(payload: ChatPayload): NotificationContent {
    const { roomId, message, senderName } = payload;
    
    let body = 'Sent a message';
    
    if (message.text && message.text.trim().length > 0) {
      body = message.text;
    } else if (message.attachments && message.attachments.length > 0) {
      const firstAttachment = message.attachments[0];
      if (firstAttachment.type === 'image') {
        body = '📷 Sent an image';
      } else if (firstAttachment.type === 'video') {
         body = '🎥 Sent a video';
      } else {
         body = '📎 Sent an attachment';
      }
    }

    return {
      title: senderName || 'New Message',
      body: body,
      data: { roomId: roomId, type: 'CHAT_MESSAGE' },
    };
  }

  handleTap(data: Record<string, any>, router: any): void {
    if (data.roomId) {
      router.push(`/community/chat/${data.roomId}`);
    }
  }
}
