import { ChatUser } from './ChatUser';

/**
 * Direct message entity - represents a 1:1 chat
 */
export interface DirectMessage {
  id: string;
  user: ChatUser;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount?: number;
}
