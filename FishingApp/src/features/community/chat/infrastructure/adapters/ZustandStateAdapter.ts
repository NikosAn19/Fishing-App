import { ChatStatePort } from '../../domain/ports/ChatStatePort';
import { Message } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { useChatStore } from '../state/ChatStore';

/**
 * Zustand implementation of ChatStatePort
 * Can be swapped for Redux/MobX/Context
 */
export class ZustandStateAdapter implements ChatStatePort {
  setMessages(roomId: string, messages: Message[]): void {
    useChatStore.getState().setMessages(roomId, messages);
  }

  addMessage(roomId: string, message: Message): void {
    useChatStore.getState().addMessage(roomId, message);
  }

  prependMessages(roomId: string, messages: Message[]): void {
    useChatStore.getState().prependMessages(roomId, messages);
  }

  updateMessageStatus(
    roomId: string,
    tempId: string,
    status: MessageStatus,
    newId?: string
  ): void {
    useChatStore.getState().updateMessageStatus(roomId, tempId, status, newId);
  }

  setLoadingHistory(loading: boolean): void {
    useChatStore.getState().setLoadingHistory(loading);
  }

  setHasMore(roomId: string, hasMore: boolean): void {
    useChatStore.getState().setHasMore(roomId, hasMore);
  }

  setActiveRoom(roomId: string | null): void {
    useChatStore.getState().setActiveRoom(roomId);
  }

  setRooms(rooms: ChatRoom[]): void {
    useChatStore.getState().setRooms(rooms);
  }

  getMessages(roomId: string): Message[] {
    return useChatStore.getState().messages[roomId] || [];
  }

  getIsLoadingHistory(): boolean {
    return useChatStore.getState().isLoadingHistory;
  }
}
