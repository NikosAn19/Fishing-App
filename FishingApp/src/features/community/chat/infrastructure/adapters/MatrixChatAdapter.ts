import { MatrixClient, EventType, MsgType, RoomEvent, Room, NotificationCountType } from 'matrix-js-sdk';
import { ChatAdapterPort } from '../../domain/ports/ChatAdapterPort';
import { Message } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { DirectMessage } from '../../domain/entities/DirectMessage';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { ChatRoomType } from '../../domain/enums/ChatRoomType';
import { PaginationService } from '../../application/services/PaginationService';
import { EventHandlerRegistry } from '../../application/services/EventHandlerRegistry';

/**
 * Matrix implementation of ChatAdapterPort
 * Thin layer - only translation, no business logic
 */
export class MatrixChatAdapter implements ChatAdapterPort {
  private paginationService: PaginationService;
  private eventRegistry: EventHandlerRegistry;

  constructor(private client: MatrixClient) {
    this.paginationService = new PaginationService(client);
    this.eventRegistry = new EventHandlerRegistry();
  }

  async sendMessage(roomId: string, text: string): Promise<string> {
    const response = await this.client.sendEvent(roomId, EventType.RoomMessage, {
      msgtype: MsgType.Text,
      body: text,
    });
    return response.event_id;
  }

  getMessages(roomId: string): Message[] {
    const room = this.client.getRoom(roomId);
    if (!room) return [];

    return room
      .getLiveTimeline()
      .getEvents()
      .filter((event) => event.getType() === EventType.RoomMessage)
      .map((event) => this.toMessage(event))
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest → Newest
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const handler = (event: any, room: any, toStartOfTimeline: boolean | undefined) => {
      // Ignore pagination events (back-fill)
      if (toStartOfTimeline) return;

      if (room?.roomId === roomId && event.getType() === EventType.RoomMessage) {
        // Filter out local echoes (sending state) to avoid duplicates
        if (event.isSending() || event.getId().startsWith('~')) {
          return;
        }
        onMessage(this.toMessage(event));
      }
    };

    this.client.on(RoomEvent.Timeline, handler);
    return () => this.client.off(RoomEvent.Timeline, handler);
  }

  async loadHistory(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }> {
    const room = this.client.getRoom(roomId);
    if (!room) return { messages: [], hasMore: false };

    const timeline = room.getLiveTimeline();

    // Fetch previous page of events
    const hasMore = await this.client.paginateEventTimeline(timeline, {
      backwards: true,
      limit: 20,
    });

    // Get all events from timeline and filter for messages
    const messages = room
      .getLiveTimeline()
      .getEvents()
      .filter((event) => event.getType() === EventType.RoomMessage)
      .map((event) => this.toMessage(event))
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest → Newest

    return { messages, hasMore };
  }

  async fetchInitialMessages(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }> {
    const room = this.client.getRoom(roomId);
    if (!room) return { messages: [], hasMore: false };

    // Use PaginationService to fetch until we have enough messages
    const { events, hasMore } = await this.paginationService.fetchUntilCount(roomId, 20);

    // Convert events to messages
    const messages = events
      .filter((event) => event.getType() === EventType.RoomMessage)
      .map((event) => this.toMessage(event))
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest → Newest

    return { messages, hasMore };
  }

  async fetchPublicRooms(): Promise<ChatRoom[]> {
    const response = await this.client.publicRooms({ limit: 100 });
    
    return response.chunk.map((room: any) => ({
      id: room.room_id,
      name: room.name || 'Unnamed Room',
      avatarUrl: room.avatar_url,
      unreadCount: 0,
      type: ChatRoomType.CHANNEL,
    }));
  }

  async fetchDirectMessages(): Promise<DirectMessage[]> {
    const rooms = this.client.getRooms();
    const directRooms = rooms.filter((room) => {
      return room.getMyMembership() === 'join' && this.isDirectChat(room);
    });
    
    return directRooms.map((room) => this.toDirectMessage(room));
  }

  async getRoomDetails(roomId: string): Promise<ChatRoom | null> {
    const room = this.client.getRoom(roomId);
    if (!room) return null;
    
    return {
      id: room.roomId,
      name: room.name || 'Unknown Room',
      avatarUrl: room.getAvatarUrl(this.client.baseUrl, 40, 40, 'crop') || undefined,
      unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
      type: this.isDirectChat(room) ? ChatRoomType.DIRECT : ChatRoomType.CHANNEL,
    };
  }

  async initialize(): Promise<boolean> {
    return this.client.isInitialSyncComplete();
  }

  subscribeToRoomUpdates(callback: (rooms: ChatRoom[]) => void): () => void {
    const handler = () => {
      const rooms = this.client.getRooms().map((room) => ({
        id: room.roomId,
        name: room.name || 'Unknown',
        avatarUrl: room.getAvatarUrl(this.client.baseUrl, 40, 40, 'crop') || undefined,
        unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
        type: this.isDirectChat(room) ? ChatRoomType.DIRECT : ChatRoomType.CHANNEL,
      }));
      callback(rooms);
    };
    
    this.client.on(RoomEvent.MyMembership, handler);
    this.client.on(RoomEvent.Timeline, handler);
    
    return () => {
      this.client.off(RoomEvent.MyMembership, handler);
      this.client.off(RoomEvent.Timeline, handler);
    };
  }

  /**
   * Check if a room is a direct chat
   */
  private isDirectChat(room: Room): boolean {
    const dmTag = room.getAccountData('m.direct');
    return dmTag !== undefined;
  }

  /**
   * Convert Matrix room to DirectMessage entity
   */
  private toDirectMessage(room: Room): DirectMessage {
    const members = room.getJoinedMembers();
    const otherMember = members.find((m) => m.userId !== this.client.getUserId());
    
    const lastEvent = room.timeline[room.timeline.length - 1];
    const lastMessage = lastEvent ? {
      text: lastEvent.getContent()?.body || 'No messages yet',
      timestamp: new Date(lastEvent.getTs()).toISOString(),
    } : undefined;
    
    return {
      id: room.roomId,
      user: {
        id: otherMember?.userId || 'unknown',
        name: otherMember?.name || 'Unknown User',
        avatarUrl: otherMember?.getMxcAvatarUrl() || undefined,
      },
      lastMessage,
      unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
    };
  }

  /**
   * Pure translation from Matrix Event to Message entity
   */
  private toMessage(event: any): Message {
    return {
      id: event.getId(),
      text: event.getContent().body,
      senderId: event.getSender(),
      status: MessageStatus.SENT, // Incoming messages are always 'sent'
      timestamp: event.getTs(),
    };
  }
}
