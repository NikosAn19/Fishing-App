import { create } from 'zustand';
import { Message } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { ChatRoomType } from '../../domain/enums/ChatRoomType';

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
  totalUnreadCount: number;

  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (roomId: string, msg: Message) => void;
  updateMessageStatus: (roomId: string, tempId: string, status: string, newId?: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  setLoadingHistory: (loading: boolean) => void;
  setHasMore: (roomId: string, hasMore: boolean) => void;
  prependMessages: (roomId: string, messages: Message[]) => void;
  
  // Unread Actions
  setUnreadCount: (roomId: string, count: number) => void;
  incrementUnread: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
  
  // Room Management
  removeRoom: (roomId: string) => void;
  upsertRooms: (rooms: ChatRoom[]) => void;
  setRoomsByType: (type: ChatRoomType, rooms: ChatRoom[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: {},
  messages: {},
  activeRoomId: null,
  isLoadingHistory: false,
  hasMore: {},
  totalUnreadCount: 0,

  setRooms: (roomsList) =>
    set((state) => {
      const roomsMap = roomsList.reduce((acc, room) => {
        acc[room.id] = room;
        return acc;
      }, {} as Record<string, ChatRoom>);
      
      // Calculate total unread from all rooms
      const totalUnread = roomsList.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
      
      return { rooms: roomsMap, totalUnreadCount: totalUnread };
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

  setUnreadCount: (roomId, count) =>
    set((state) => {
      const room = state.rooms[roomId];
      if (!room) return state;

      const oldRoomCount = room.unreadCount || 0;
      const diff = count - oldRoomCount;

      return {
        rooms: {
          ...state.rooms,
          [roomId]: { ...room, unreadCount: count },
        },
        totalUnreadCount: Math.max(0, state.totalUnreadCount + diff),
      };
    }),

  incrementUnread: (roomId) =>
    set((state) => {
      console.log(`[ChatStore] incrementUnread called for ${roomId}. Current Total: ${state.totalUnreadCount}`);
      const room = state.rooms[roomId];
      
      // If room exists, update it specifically
      if (room) {
        console.log(`[ChatStore] Room found. New count: ${(room.unreadCount || 0) + 1}`);
        return {
          rooms: {
            ...state.rooms,
            [roomId]: { ...room, unreadCount: (room.unreadCount || 0) + 1 },
          },
          totalUnreadCount: state.totalUnreadCount + 1,
        };
      }
      
      console.log(`[ChatStore] Room NOT found. Incrementing Total to: ${state.totalUnreadCount + 1}`);
      // If room not loaded yet, still increment total for badge visibility
      return {
        totalUnreadCount: state.totalUnreadCount + 1,
      };
    }),

  clearUnread: (roomId) =>
    set((state) => {
      const room = state.rooms[roomId];
      if (!room) return state;

      const oldRoomCount = room.unreadCount || 0;

      return {
        rooms: {
          ...state.rooms,
          [roomId]: { ...room, unreadCount: 0 },
        },
        totalUnreadCount: Math.max(0, state.totalUnreadCount - oldRoomCount),
      };
    }),
    
  removeRoom: (roomId) =>
    set((state) => {
        const { [roomId]: deleted, ...remainingRooms } = state.rooms;
        const countToRemove = deleted?.unreadCount || 0;
        
        return {
            rooms: remainingRooms,
            totalUnreadCount: Math.max(0, state.totalUnreadCount - countToRemove),
        };
    }),

  upsertRooms: (newRooms) =>
    set((state) => {
       const roomsMap = { ...state.rooms };
       newRooms.forEach(room => {
           roomsMap[room.id] = room;
       });
       
       const totalUnread = Object.values(roomsMap).reduce((sum, r) => sum + (r.unreadCount || 0), 0);
       
       return { rooms: roomsMap, totalUnreadCount: totalUnread };
    }),

  setRoomsByType: (type, newRooms) =>
    set((state) => {
        // 1. Filter out existing rooms of this type from the map
        const otherTypeRooms = Object.values(state.rooms).filter(r => r.type !== type);
        
        // 2. Create map from kept rooms + new rooms
        const roomsMap: Record<string, ChatRoom> = {};
        
        otherTypeRooms.forEach(r => roomsMap[r.id] = r);
        newRooms.forEach(r => roomsMap[r.id] = r);
        
        // 3. Recalculate Total
        const totalUnread = Object.values(roomsMap).reduce((sum, r) => sum + (r.unreadCount || 0), 0);
        
        return { rooms: roomsMap, totalUnreadCount: totalUnread };
    }),
}));
