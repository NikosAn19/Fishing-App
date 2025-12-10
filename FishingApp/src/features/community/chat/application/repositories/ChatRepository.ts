import { ChatStatePort } from '../../domain/ports/ChatStatePort';
import { ChatAdapterPort } from '../../domain/ports/ChatAdapterPort';
import { Message, MessageAttachment } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { DirectMessage } from '../../domain/entities/DirectMessage';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { ChatError } from '../../domain/errors/ChatError';
import { ChatErrorCode } from '../../domain/enums/ChatErrorCode';


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
      senderId: this.adapterPort.getCurrentUserId() || 'me',
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
      this.statePort.setLoadingHistory(true);
      // Clear previous messages to prevent "20 messages" bug
      this.statePort.setMessages(roomId, []); 
      
      const { messages, hasMore } = await this.adapterPort.fetchInitialMessages(roomId);
      this.statePort.setMessages(roomId, messages);
      this.statePort.setHasMore(roomId, hasMore);
    } catch (error) {
      console.error('ChatRepository: Failed to load messages', error);
      throw new ChatError('Failed to load messages', ChatErrorCode.NETWORK_ERROR, error);
    } finally {
      this.statePort.setLoadingHistory(false);
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
      
      // Get oldest message ID from store to support virtual pagination
      const currentMessages = this.statePort.getMessages(roomId);
      const oldestMessageId = currentMessages.length > 0 ? currentMessages[0].id : undefined;
      
      const { messages, hasMore } = await this.adapterPort.loadHistory(roomId, oldestMessageId);

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
      const roomId = await this.adapterPort.joinOrCreateRoom(channelId);
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

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.adapterPort.getCurrentUserId();
  }

  /**
   * Send a message with optional text and attachments
   */
  async sendMessageWithAttachments(
    roomId: string,
    text?: string,
    attachments?: MessageAttachment[]
  ): Promise<void> {
    // Validate: must have either text or attachments
    if (!text && (!attachments || attachments.length === 0)) {
      throw new ChatError(
        'Message must have text or attachments',
        ChatErrorCode.INVALID_MESSAGE
      );
    }

    // 1. OPTIMISTIC UPDATE: Show immediately
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      senderId: this.adapterPort.getCurrentUserId() || 'me',
      status: MessageStatus.SENDING,
      timestamp: Date.now(),
      text,
      attachments,
    };
    this.statePort.addMessage(roomId, tempMsg);

    try {
      // 2. NETWORK CALL: Send to server
      const eventId = await this.adapterPort.sendMessageWithAttachments(
        roomId,
        text,
        attachments
      );

      // 3. CONFIRMATION: Update status
      this.statePort.updateMessageStatus(roomId, tempId, MessageStatus.SENT, eventId);
    } catch (error) {
      console.error('ChatRepository: Send failed', error);
      this.statePort.updateMessageStatus(roomId, tempId, MessageStatus.FAILED);
      throw new ChatError(
        'Failed to send message',
        ChatErrorCode.MESSAGE_SEND_FAILED,
        error
      );
    }
  }

  /**
   * Upload media file
   */
  async uploadMedia(
    fileUri: string,
    type: 'image' | 'video' | 'audio' | 'file'
  ): Promise<MessageAttachment> {
    try {
      return await this.adapterPort.uploadMedia(fileUri, type);
    } catch (error) {
      console.error('ChatRepository: Upload failed', error);
      throw new ChatError('Failed to upload media', ChatErrorCode.UPLOAD_FAILED, error);
    }
  }

  /**
   * Convenience method: Send image with optional caption
   */
  async sendImage(roomId: string, imageUri: string, caption?: string): Promise<void> {
    // 1. Upload image
    const attachment = await this.uploadMedia(imageUri, 'image');
    
    // 2. Send message with attachment
    await this.sendMessageWithAttachments(roomId, caption, [attachment]);
  }

  /**
   * Convenience method: Send multiple images (carousel)
   */
  async sendImages(
    roomId: string,
    imageUris: string[],
    caption?: string
  ): Promise<void> {
    // 1. Upload all images in parallel
    const attachments = await Promise.all(
      imageUris.map(uri => this.uploadMedia(uri, 'image'))
    );
    
    // 2. Send message with all attachments
    await this.sendMessageWithAttachments(roomId, caption, attachments);
  }
}
