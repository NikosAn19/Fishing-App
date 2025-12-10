import { create } from 'zustand';
import { Message } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';

/**
 * Zustand store - implementation detail
 * Accessed only through ZustandStateAdapter
 */
interface ChatState {
  rooms: Record<string, ChatRoom>;
  messages: Record<string, Message[]>;
  activeRoomId: string | null;
  isLoadingHistory: boolean;
  hasMore: Record<string, boolean>;

  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (roomId: string, msg: Message) => void;
  updateMessageStatus: (roomId: string, tempId: string, status: string, newId?: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  setLoadingHistory: (loading: boolean) => void;
  setHasMore: (roomId: string, hasMore: boolean) => void;
  prependMessages: (roomId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: {},
  messages: {},
  activeRoomId: null,
  isLoadingHistory: false,
  hasMore: {},

  setRooms: (roomsList) =>
    set((state) => {
      const roomsMap = roomsList.reduce((acc, room) => {
        acc[room.id] = room;
        return acc;
      }, {} as Record<string, ChatRoom>);
      return { rooms: roomsMap };
    }),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: messages,
      },
    })),

  addMessage: (roomId, msg) =>
    set((state) => {
      const currentMessages = state.messages[roomId] || [];
      // De-duplication: Check if message already exists
      if (currentMessages.some((m) => m.id === msg.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [roomId]: [...currentMessages, msg],
        },
      };
    }),

  updateMessageStatus: (roomId, tempId, status, newId) =>
    set((state) => {
      const currentMessages = state.messages[roomId] || [];

      // Check if the "real" message (newId) already exists (e.g. came from subscription)
      const realMessageExists = newId && currentMessages.some((m) => m.id === newId);

      if (realMessageExists) {
        // If real message exists, REMOVE the temp message to avoid duplicates
        return {
          messages: {
            ...state.messages,
            [roomId]: currentMessages.filter((m) => m.id !== tempId),
          },
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

  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),

  setHasMore: (roomId, hasMore) =>
    set((state) => ({
      hasMore: {
        ...state.hasMore,
        [roomId]: hasMore,
      },
    })),

  prependMessages: (roomId, newMessages) =>
    set((state) => {
      const currentMessages = state.messages[roomId] || [];

      // Filter out duplicates (in case of overlap)
      const uniqueNewMessages = newMessages.filter(
        (newMsg) => !currentMessages.some((existingMsg) => existingMsg.id === newMsg.id)
      );

      if (uniqueNewMessages.length === 0) {
        console.log(`📝 ChatStore: No new messages to add (all ${newMessages.length} were duplicates)`);
        return state;
      }

      // Combine and limit to prevent memory issues
      const combined = [...uniqueNewMessages, ...currentMessages];
      const limited = combined.slice(0, 200);  // Keep max 200 messages
      
      console.log(`📝 ChatStore: Added ${uniqueNewMessages.length} new messages (${currentMessages.length} → ${limited.length})`);

      return {
        messages: {
          ...state.messages,
          [roomId]: limited,
        },
      };
    }),
}));
