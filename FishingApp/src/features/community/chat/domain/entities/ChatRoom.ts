import { Message } from './Message';
import { ChatRoomType } from '../enums/ChatRoomType';

/**
 * Chat room entity
 */
export interface ChatRoom {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  type: ChatRoomType;
}
