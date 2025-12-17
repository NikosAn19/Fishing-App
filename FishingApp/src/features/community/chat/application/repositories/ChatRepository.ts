import { ChatStatePort } from '../../domain/ports/ChatStatePort';
import { ChatAdapterPort } from '../../domain/ports/ChatAdapterPort';
import { Message, MessageAttachment } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { DirectMessage } from '../../domain/entities/DirectMessage';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { ChatError } from '../../domain/errors/ChatError';
import { ChatErrorCode } from '../../domain/enums/ChatErrorCode';
import { ChatRoomType } from '../../domain/enums/ChatRoomType';


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
   * Fetch all public rooms and sync with Matrix state
   * Acts as the Single Source of Truth for Community Screen
   */
  async syncChannels(): Promise<ChatRoom[]> {
    try {
      // 1. Fetch API Channels (Structure & Metadata)
      const { chatApi } = await import('../../matrix/api/client');
      const apiChannels = await chatApi.getPublicChannels();

      // 2. Fetch Joined Matrix Rooms (State & Unreads)
      const joinedRooms = await this.adapterPort.getJoinedRooms?.() || [];
      const joinedMap = new Map(joinedRooms.map(r => [r.id, r]));

      // 3. Merge Data
      const mergedRooms: ChatRoom[] = apiChannels.map(channel => {
        const matrixRoom = joinedMap.get(channel.matrixRoomId);
        
        return {
           id: channel.matrixRoomId,
           name: channel.name, // Use name from DB as it might be cleaner options
           type: ChatRoomType.CHANNEL,
           avatarUrl: undefined,
           unreadCount: matrixRoom ? (matrixRoom.unreadCount || 0) : 0, 
           // If we have matrix room, we might want last message etc.
        };
      });

      // 4. Update Store (Safe Update)
      this.statePort.setRoomsByType(ChatRoomType.CHANNEL, mergedRooms);
      
      return mergedRooms;
    } catch (error) {
      console.error('ChatRepository: Failed to sync channels', error);
      throw new ChatError('Failed to sync channels', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Fetch all public rooms (channels)
   * @deprecated Use syncChannels instead for full badge support
   */
  async fetchPublicRooms(): Promise<ChatRoom[]> {
    return this.syncChannels();
  }

  /**
   * Fetch direct message conversations
   */
  /**
   * Fetch direct message conversations
   */
  async fetchDirectMessages(): Promise<DirectMessage[]> {
    try {
      const dms = await this.adapterPort.fetchDirectMessages();
      
      // Update store for RoomList component
      const chatRooms: ChatRoom[] = dms.map(dm => ({
          id: dm.id,
          name: dm.user.name,
          type: ChatRoomType.DIRECT,
          avatarUrl: dm.user.avatarUrl,
          unreadCount: dm.unreadCount || 0,
          lastMessage: dm.lastMessage ? {
              id: 'latest', 
              senderId: dm.user.id,
              text: dm.lastMessage.text,
              timestamp: new Date(dm.lastMessage.timestamp).getTime(),
              status: MessageStatus.SENT
          } : undefined
      }));
      
      // We need to merge with existing rooms, not replace all (channels + dms)
      // Since ChatStore.setRooms replaces ALL, we should probably fetch channels too or handle merge in store.
      // But ChatStore.setRooms uses a map, so it might overwrite.
      // Actually setRooms implementation: const roomsMap = ...; return { rooms: roomsMap }
      // It REPLACES everything. This is dangerous if we only fetch DMs.
      // We should use a new method `upsertRooms` or `addRooms`.
      // For now, let's assume `syncChannels` handles channels and this handles DMs.
      // Since RoomList separates them, maybe we can just rely on `upsert` behavior.
      // I will assume for now I cannot change Store contract too much. I will use a separate logic in RoomList.
      // WAIT, ChatStore.setRooms replaces EVERYTHING.
      
      // Safer approach: Get current rooms, merge, set back.
      // But we can't get current rooms easily from here (Repository logic).
      // Let's postpone store update for fetchDirectMessages until I verify Store capabilities.
      // Instead, just focus on deleteChat REMOVING from store.
      
      return dms;
    } catch (error) {
      console.error('ChatRepository: Failed to fetch direct messages', error);
      throw new ChatError('Failed to fetch direct messages', ChatErrorCode.NETWORK_ERROR, error);
    }
  }

  /**
   * Fetch DMs and sync with store (Single Source of Truth)
   */
  async syncDirectMessages(): Promise<DirectMessage[]> {
      try {
          const dms = await this.fetchDirectMessages();
          
          const rooms: ChatRoom[] = dms.map(dm => ({
              id: dm.id,
              name: dm.user.name,
              type: ChatRoomType.DIRECT,
              avatarUrl: dm.user.avatarUrl,
              unreadCount: dm.unreadCount || 0,
              lastMessage: dm.lastMessage ? {
                  id: 'latest', // Dummy ID for preview
                  senderId: dm.user.id,
                  text: dm.lastMessage.text,
                  timestamp: new Date(dm.lastMessage.timestamp).getTime(),
                  status: MessageStatus.SENT
              } : undefined,
              metadata: { 
                  otherUserId: dm.user.id
              }
          }));

          console.log(`[ChatRepository] Syncing ${rooms.length} DMs to Store`);
          this.statePort.setRoomsByType(ChatRoomType.DIRECT, rooms);
          return dms;
      } catch (error) {
          console.error('[ChatRepository] Failed to sync DMs', error);
          throw error;
      }
  }

  // ...

  /**
   * Delete a chat (leave room and forget it)
   */
  async deleteChat(roomId: string): Promise<boolean> {
      try {
          const success = await this.adapterPort.leaveRoom(roomId);
          if (success) {
              this.statePort.removeRoom(roomId); // Immediate UI update
          }
          return success;
      } catch (error) {
          console.error(`ChatRepository: Failed to delete chat ${roomId}`, error);
          throw new ChatError('Failed to delete chat', ChatErrorCode.NETWORK_ERROR, error);
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

  /**
   * Subscribe to global messages (for notifications)
   */
  subscribeToAllMessages(callback: (roomId: string, msg: Message, senderName?: string) => void): () => void {
    return this.adapterPort.subscribeToAllMessages(callback);
  }

  /**
   * Delete a chat (leave room and forget it)
   */


  /**
   * Leave a room (without forgetting history? Or same as delete?)
   * For Matrix, leaving implies not receiving updates.
   * If it's a public channel, we just leave.
   */
  async leaveRoom(roomId: string): Promise<boolean> {
      try {
          // For now, leaveRoom and deleteChat might be similar in implementation 
          // but semantically different for the app.
          // deleteChat implies DMs (forgetting history).
          // leaveRoom implies Channels (just leaving).
          // However, adapterPort.leaveRoom usually does both or just leave.
          // Let's reuse adapterPort.leaveRoom which likely does standard Matrix leave.
          // And we should also remove from store to update UI.
          const success = await this.adapterPort.leaveRoom(roomId);
          if (success) {
              this.statePort.removeRoom(roomId);
          }
          return success;
      } catch (error) {
           console.error(`ChatRepository: Failed to leave room ${roomId}`, error);
           throw new ChatError('Failed to leave room', ChatErrorCode.NETWORK_ERROR, error);
      }
  }

  /**
   * Mark room as read
   */
  async markAsRead(roomId: string): Promise<void> {
    try {
      await this.adapterPort.markAsRead(roomId);
      // Optimistically clear unread count in store
      this.statePort.clearUnread(roomId);
    } catch (error) {
       console.error(`ChatRepository: Failed to mark ${roomId} as read`, error);
    }
  }
}
