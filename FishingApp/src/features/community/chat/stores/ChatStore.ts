// src/features/community/chat/stores/ChatStore.ts
import { create } from 'zustand';
import { ChatRoomEntity, MessageEntity } from '../domain/types';

interface ChatState {
  rooms: Record<string, ChatRoomEntity>;
  messages: Record<string, MessageEntity[]>; // Keyed by Room ID
  activeRoomId: string | null;
  
  // Actions
  setRooms: (rooms: ChatRoomEntity[]) => void;
  setMessages: (roomId: string, messages: MessageEntity[]) => void;
  addMessage: (roomId: string, msg: MessageEntity) => void;
  updateMessageStatus: (roomId: string, tempId: string, status: string, newId?: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  
  // Infinite Scroll
  isLoadingHistory: boolean;
  setLoadingHistory: (loading: boolean) => void;
  hasMore: Record<string, boolean>;
  setHasMore: (roomId: string, hasMore: boolean) => void;
  prependMessages: (roomId: string, messages: MessageEntity[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: {},
  messages: {},
  activeRoomId: null,

  setRooms: (roomsList) => set((state) => {
    const roomsMap = roomsList.reduce((acc, room) => {
      acc[room.id] = room;
      return acc;
    }, {} as Record<string, ChatRoomEntity>);
    return { rooms: roomsMap };
  }),

  setMessages: (roomId, messages) => set((state) => ({
      messages: {
          ...state.messages,
          [roomId]: messages,
      }
  })),

  addMessage: (roomId, msg) => set((state) => {
    const currentMessages = state.messages[roomId] || [];
    // De-duplication: Check if message already exists
    if (currentMessages.some(m => m.id === msg.id)) {
        return state;
    }
    return {
      messages: {
        ...state.messages,
        [roomId]: [...currentMessages, msg],
      },
    };
  }),

  updateMessageStatus: (roomId, tempId, status, newId) => set((state) => {
    const currentMessages = state.messages[roomId] || [];
    
    // Check if the "real" message (newId) already exists (e.g. came from subscription)
    const realMessageExists = newId && currentMessages.some(m => m.id === newId);

    if (realMessageExists) {
        // If real message exists, REMOVE the temp message to avoid duplicates
        return {
            messages: {
                ...state.messages,
                [roomId]: currentMessages.filter(m => m.id !== tempId),
            }
        };
    }

    // Otherwise, update the temp message in place
    const updatedMessages = currentMessages.map((msg) => {
      if (msg.id === tempId) {
        return { ...msg, status: status as any, id: newId || msg.id };
      }
      return msg;
    });
    return {
      messages: {
        ...state.messages,
        [roomId]: updatedMessages,
      },
    };
  }),

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  // Infinite Scroll Support
  isLoadingHistory: false,
  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  
  hasMore: {},
  setHasMore: (roomId, hasMore) => set((state) => ({
      hasMore: {
          ...state.hasMore,
          [roomId]: hasMore
      }
  })),
  
  prependMessages: (roomId, newMessages) => set((state) => {
      const currentMessages = state.messages[roomId] || [];
      
      // Filter out duplicates (in case of overlap)
      const uniqueNewMessages = newMessages.filter(
          newMsg => !currentMessages.some(existingMsg => existingMsg.id === newMsg.id)
      );

      if (uniqueNewMessages.length === 0) return state;

      return {
          messages: {
              ...state.messages,
              [roomId]: [...uniqueNewMessages, ...currentMessages],
          }
      };
  }),
}));
