// src/features/community/chat/repositories/ChatRepository.ts
import { MatrixChatAdapter } from '../adapters/MatrixChatAdapter';
import { useChatStore } from '../stores/ChatStore';
import { MessageEntity, MessageStatus } from '../domain/types';
import { matrixService } from '../matrix/MatrixService'; // Access the singleton client

export class ChatRepository {
  private adapter: MatrixChatAdapter | null = null;

  private getAdapter(): MatrixChatAdapter {
      if (!this.adapter) {
          const client = matrixService.auth.getClient();
          if (!client) {
              throw new Error("Matrix Client not initialized");
          }
          this.adapter = new MatrixChatAdapter(client);
      }
      return this.adapter;
  }

  async sendMessage(roomId: string, text: string) {
    // 1. OPTIMISTIC UPDATE: Immediate feedback
    const tempId = `temp-${Date.now()}`;
    const tempMsg: MessageEntity = { 
      id: tempId, 
      text, 
      senderId: matrixService.auth.getUserId() || 'me', 
      status: MessageStatus.Sending, 
      timestamp: Date.now() 
    };
    useChatStore.getState().addMessage(roomId, tempMsg);

    try {
      // 2. NETWORK CALL
      const adapter = this.getAdapter();
      const eventId = await adapter.sendMessage(roomId, text);
      
      // 3. CONFIRMATION
      useChatStore.getState().updateMessageStatus(roomId, tempId, MessageStatus.Sent, eventId);
    } catch (error) {
      console.error("ChatRepository: Send failed", error);
      useChatStore.getState().updateMessageStatus(roomId, tempId, MessageStatus.Failed);
    }
  }

  async loadMessages(roomId: string) {
      const adapter = this.getAdapter();
      // Use fetchInitialMessages to ensure we get history from server if needed
      const { messages, hasMore } = await adapter.fetchInitialMessages(roomId);
      useChatStore.getState().setMessages(roomId, messages);
      useChatStore.getState().setHasMore(roomId, hasMore);
  }

  async loadMoreMessages(roomId: string) {
      const store = useChatStore.getState();
      
      // Guard: Don't load if already loading OR if no more history exists
      if (store.isLoadingHistory || store.hasMore[roomId] === false) {
          console.log("ChatRepository: Skipping loadMore (Loading:", store.isLoadingHistory, "HasMore:", store.hasMore[roomId], ")");
          return;
      }

      try {
          store.setLoadingHistory(true);
          const adapter = this.getAdapter();
          const { messages, hasMore } = await adapter.loadHistory(roomId);
          
          store.prependMessages(roomId, messages);
          store.setHasMore(roomId, hasMore);
      } catch (error) {
          console.error("ChatRepository: Failed to load history", error);
      } finally {
          store.setLoadingHistory(false);
      }
  }

  subscribeToRoom(roomId: string): () => void {
      const adapter = this.getAdapter();
      return adapter.subscribeToRoom(roomId, (msg) => {
          useChatStore.getState().addMessage(roomId, msg);
      });
  }

  async joinRoom(channelId: string): Promise<string | null> {
      try {
          // We can access matrixService directly here as it's a singleton, 
          // or we could wrap it in the adapter. 
          // For consistency, let's use the service directly for now as it's a "Manager" level operation
          // or add it to adapter.
          // Let's add it to adapter to keep repository clean of direct service calls if possible.
          // But matrixService.rooms is separate from MatrixClient.
          // Let's use matrixService.rooms directly for now as it's already imported.
          const roomId = await matrixService.rooms.joinOrOpenChat(channelId);
          return roomId;
      } catch (e) {
          console.error("ChatRepository: Failed to join room", e);
          return null;
      }
  }
}

export const chatRepository = new ChatRepository();
