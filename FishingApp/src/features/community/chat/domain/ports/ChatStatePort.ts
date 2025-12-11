import { Message } from '../entities/Message';
import { MessageStatus } from '../enums/MessageStatus';
import { ChatRoom } from '../entities/ChatRoom';

/**
 * Interface for state management
 * Allows swapping Zustand for Redux/MobX/Context
 */
export interface ChatStatePort {
  // Messages
  setMessages(roomId: string, messages: Message[]): void;
  addMessage(roomId: string, message: Message): void;
  prependMessages(roomId: string, messages: Message[]): void;
  updateMessageStatus(
    roomId: string,
    tempId: string,
    status: MessageStatus,
    newId?: string
  ): void;

  // Pagination
  setLoadingHistory(loading: boolean): void;
  setHasMore(roomId: string, hasMore: boolean): void;

  // Room
  setActiveRoom(roomId: string | null): void;
  setRooms(rooms: ChatRoom[]): void;
  
  // Unread
  setUnreadCount(roomId: string, count: number): void;
  incrementUnread(roomId: string): void;
  clearUnread(roomId: string): void;
  
  // Getters
  getMessages(roomId: string): Message[];
  getIsLoadingHistory(): boolean;
}
