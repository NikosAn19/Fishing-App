import { Message } from '../entities/Message';
import { ChatRoom } from '../entities/ChatRoom';
import { DirectMessage } from '../entities/DirectMessage';
import { MessageAttachment } from '../entities/MessageAttachment';

/**
 * Interface for chat adapter (e.g., Matrix, XMPP, custom)
 * Allows swapping Matrix for other chat protocols
 */
export interface ChatAdapterPort {
  // Message operations
  sendMessage(roomId: string, text: string): Promise<string>;
  getMessages(roomId: string): Message[];
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
  loadHistory(roomId: string, oldestMessageId?: string): Promise<{ messages: Message[]; hasMore: boolean }>;
  fetchInitialMessages(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }>;
  
  // Room operations
  fetchPublicRooms(): Promise<ChatRoom[]>;
  fetchDirectMessages(): Promise<DirectMessage[]>;
  getRoomDetails(roomId: string): Promise<ChatRoom | null>;
  leaveRoom(roomId: string): Promise<boolean>;
  
  // Matrix specific
  initialize(): Promise<boolean>;
  subscribeToRoomUpdates(callback: (rooms: ChatRoom[]) => void): () => void;
  
  // User operations
  getCurrentUserId(): string | null;
  joinOrCreateRoom(channelId: string): Promise<string | null>;
  getJoinedRooms?(): Promise<ChatRoom[]>;
  
  // Notification operations
  subscribeToAllMessages(callback: (roomId: string, message: Message, senderName?: string) => void): () => void;
  markAsRead(roomId: string, eventId?: string): Promise<void>;
  
  // Media operations
  /**
   * Send a message with optional text and/or attachments
   * @param roomId - Room to send to
   * @param text - Optional text content (caption or standalone)
   * @param attachments - Optional media attachments
   * @returns Message ID
   */
  sendMessageWithAttachments(
    roomId: string,
    text?: string,
    attachments?: MessageAttachment[]
  ): Promise<string>;
  
  /**
   * Upload media file and get attachment object
   * @param fileUri - Local file URI
   * @param type - Attachment type
   * @returns Attachment object with uploaded URL
   */
  uploadMedia(
    fileUri: string,
    type: 'image' | 'video' | 'audio' | 'file'
  ): Promise<MessageAttachment>;
}
