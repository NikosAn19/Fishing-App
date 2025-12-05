import { ChatStatePort } from '../../domain/ports/ChatStatePort';
import { ChatAdapterPort } from '../../domain/ports/ChatAdapterPort';
import { Message } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { DirectMessage } from '../../domain/entities/DirectMessage';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { ChatError } from '../../domain/errors/ChatError';
import { ChatErrorCode } from '../../domain/enums/ChatErrorCode';
import { matrixService } from '../../matrix/MatrixService';

/**
 * Repository pattern - orchestrates business logic
 * Uses dependency injection (ports) instead of direct imports
 */
export class ChatRepository {
  constructor(
    private statePort: ChatStatePort,
    private adapterPort: ChatAdapterPort
  ) {}

  /**
   * Send a message with optimistic updates
   */
  async sendMessage(roomId: string, text: string): Promise<void> {
    // 1. OPTIMISTIC UPDATE: Immediate feedback
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      text,
      senderId: matrixService.auth.getUserId() || 'me',
      status: MessageStatus.SENDING,
      timestamp: Date.now(),
    };
    this.statePort.addMessage(roomId, tempMsg);

    try {
      // 2. NETWORK CALL
      const eventId = await this.adapterPort.sendMessage(roomId, text);

      // 3. CONFIRMATION
      this.statePort.updateMessageStatus(roomId, tempId, MessageStatus.SENT, eventId);
    } catch (error) {
      console.error('ChatRepository: Send failed', error);
      this.statePort.updateMessageStatus(roomId, tempId, MessageStatus.FAILED);
      throw new ChatError('Failed to send message', ChatErrorCode.MESSAGE_SEND_FAILED, error);
    }
  }

  /**
   * Load initial messages for a room
   */
  async loadMessages(roomId: string): Promise<void> {
    try {
      const { messages, hasMore } = await this.adapterPort.fetchInitialMessages(roomId);
      this.statePort.setMessages(roomId, messages);
      this.statePort.setHasMore(roomId, hasMore);
    } catch (error) {
      console.error('ChatRepository: Failed to load messages', error);
      throw new ChatError('Failed to load messages', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Load more messages (pagination)
   */
  async loadMoreMessages(roomId: string): Promise<void> {
    // Guard: Don't load if already loading
    // Note: We can't access isLoadingHistory directly anymore, so we'll rely on the caller
    // to check this state before calling this method

    console.log(`ChatRepository: Starting loadMoreMessages for ${roomId}`);
    try {
      this.statePort.setLoadingHistory(true);
      const { messages, hasMore } = await this.adapterPort.loadHistory(roomId);

      console.log(`ChatRepository: Loaded ${messages.length} messages. HasMore: ${hasMore}`);
      this.statePort.prependMessages(roomId, messages);
      this.statePort.setHasMore(roomId, hasMore);
    } catch (error) {
      console.error('ChatRepository: Failed to load history', error);
      throw new ChatError('Failed to load message history', ChatErrorCode.PAGINATION_FAILED, error);
    } finally {
      console.log(`ChatRepository: Finished loadMoreMessages`);
      this.statePort.setLoadingHistory(false);
    }
  }

  /**
   * Subscribe to new messages in a room
   */
  subscribeToRoom(roomId: string): () => void {
    return this.adapterPort.subscribeToRoom(roomId, (msg) => {
      this.statePort.addMessage(roomId, msg);
    });
  }

  /**
   * Join a room by channel ID
   */
  async joinRoom(channelId: string): Promise<string | null> {
    try {
      // For now, we still use matrixService directly for room management
      // In the future, this could be moved to a RoomAdapterPort
      const roomId = await matrixService.rooms.joinOrOpenChat(channelId);
      return roomId;
    } catch (error) {
      console.error('ChatRepository: Failed to join room', error);
      throw new ChatError('Failed to join room', ChatErrorCode.ROOM_NOT_FOUND, error);
    }
  }

  /**
   * Fetch all public rooms (channels)
   */
  async fetchPublicRooms(): Promise<ChatRoom[]> {
    try {
      const rooms = await this.adapterPort.fetchPublicRooms();
      this.statePort.setRooms(rooms);
      return rooms;
    } catch (error) {
      console.error('ChatRepository: Failed to fetch public rooms', error);
      throw new ChatError('Failed to fetch public rooms', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Fetch direct message conversations
   */
  async fetchDirectMessages(): Promise<DirectMessage[]> {
    try {
      return await this.adapterPort.fetchDirectMessages();
    } catch (error) {
      console.error('ChatRepository: Failed to fetch direct messages', error);
      throw new ChatError('Failed to fetch direct messages', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Get room details by ID
   */
  async getRoomDetails(roomId: string): Promise<ChatRoom | null> {
    try {
      return await this.adapterPort.getRoomDetails(roomId);
    } catch (error) {
      console.error('ChatRepository: Failed to get room details', error);
      return null;
    }
  }

  /**
   * Initialize chat system
   */
  async initialize(): Promise<boolean> {
    try {
      return await this.adapterPort.initialize();
    } catch (error) {
      console.error('ChatRepository: Failed to initialize', error);
      throw new ChatError('Failed to initialize chat', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Subscribe to room list updates
   */
  subscribeToRoomUpdates(callback: (rooms: ChatRoom[]) => void): () => void {
    return this.adapterPort.subscribeToRoomUpdates(callback);
  }
}
