import { Message } from '../entities/Message';
import { ChatRoom } from '../entities/ChatRoom';
import { DirectMessage } from '../entities/DirectMessage';

/**
 * Interface for chat adapter (e.g., Matrix, XMPP, custom)
 * Allows swapping Matrix for other chat protocols
 */
export interface ChatAdapterPort {
  // Message operations
  sendMessage(roomId: string, text: string): Promise<string>;
  getMessages(roomId: string): Message[];
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
  loadHistory(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }>;
  fetchInitialMessages(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }>;
  
  // Room operations
  fetchPublicRooms(): Promise<ChatRoom[]>;
  fetchDirectMessages(): Promise<DirectMessage[]>;
  getRoomDetails(roomId: string): Promise<ChatRoom | null>;
  initialize(): Promise<boolean>;
  subscribeToRoomUpdates(callback: (rooms: ChatRoom[]) => void): () => void;
}
