import { NotificationStrategy } from '../types/NotificationStrategy';
import { NotificationContent } from '../types/NotificationTypes';
import { Message } from '../../community/chat/domain/entities/Message';
import { NotificationMessage } from '../types/NotificationMessages';

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
      body = message.text; // Text content is dynamic, keep as is or use a format if needed
    } else if (message.attachments && message.attachments.length > 0) {
      const firstAttachment = message.attachments[0];
      if (firstAttachment.type === 'image') {
        body = NotificationMessage.CHAT_IMAGE;
      } else if (firstAttachment.type === 'video') {
         body = NotificationMessage.CHAT_VIDEO;
      } else {
         body = NotificationMessage.CHAT_ATTACHMENT;
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
