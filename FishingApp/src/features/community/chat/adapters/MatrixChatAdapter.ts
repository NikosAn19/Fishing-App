// src/features/community/chat/adapters/MatrixChatAdapter.ts
import { MatrixClient, EventType, MsgType, RoomEvent } from 'matrix-js-sdk';
import { MessageEntity, MessageStatus } from '../domain/types';

export class MatrixChatAdapter {
  constructor(private client: MatrixClient) {}

  async sendMessage(roomId: string, text: string): Promise<string> {
    const response = await this.client.sendEvent(roomId, EventType.RoomMessage, {
      msgtype: MsgType.Text,
      body: text,
    });
    return response.event_id;
  }

  getMessages(roomId: string): MessageEntity[] {
      // This assumes the client has already synced and has the room data
      // In a real app, we might need to call client.scrollback() or similar if history is missing
      const room = this.client.getRoom(roomId);
      if (!room) return [];
      
      return room.getLiveTimeline().getEvents()
          .filter(event => event.getType() === EventType.RoomMessage)
          .map(event => this.toMessageEntity(event))
          .sort((a, b) => a.timestamp - b.timestamp); // Ensure Oldest -> Newest
  }

  subscribeToRoom(roomId: string, onMessage: (msg: MessageEntity) => void): () => void {
      const handler = (event: any, room: any) => {
          if (room?.roomId === roomId && event.getType() === EventType.RoomMessage) {
              // Filter out local echoes (sending state) to avoid duplicates with Repository's optimistic update
              if (event.isSending() || event.getId().startsWith('~')) {
                  return;
              }
              onMessage(this.toMessageEntity(event));
          }
      };
      
      this.client.on(RoomEvent.Timeline, handler);
      return () => this.client.off(RoomEvent.Timeline, handler);
  }

  // Helper to convert Matrix Event to MessageEntity
  toMessageEntity(event: any): MessageEntity {
      return {
          id: event.getId(),
          text: event.getContent().body,
          senderId: event.getSender(),
          status: MessageStatus.Sent, // Incoming messages are always 'sent'
          timestamp: event.getTs(),
      };
  }

  async loadHistory(roomId: string): Promise<{ messages: MessageEntity[], hasMore: boolean }> {
      const room = this.client.getRoom(roomId);
      if (!room) return { messages: [], hasMore: false };

      const timeline = room.getLiveTimeline();
      
      // Fetch previous page of events
      // paginateEventTimeline returns TRUE if more events exist, FALSE if reached start
      const hasMore = await this.client.paginateEventTimeline(timeline, { 
          backwards: true, 
          limit: 20 
      });

      // Get all events from timeline and filter for messages
      const messages = room.getLiveTimeline().getEvents()
          .filter(event => event.getType() === EventType.RoomMessage)
          .map(event => this.toMessageEntity(event))
          .sort((a, b) => a.timestamp - b.timestamp); // Ensure Oldest -> Newest

      return { messages, hasMore };
  }
  async fetchInitialMessages(roomId: string): Promise<{ messages: MessageEntity[], hasMore: boolean }> {
      const room = this.client.getRoom(roomId);
      if (!room) return { messages: [], hasMore: false };

      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      let hasMore = true; // Assume true initially

      // If we have fewer than 20 messages, try to fetch more from the server
      if (events.length < 20) {
          console.log(`MatrixChatAdapter: Initial load has only ${events.length} messages. Fetching more...`);
          try {
              hasMore = await this.client.paginateEventTimeline(timeline, { 
                  backwards: true, 
                  limit: 20 
              });
          } catch (e) {
              console.warn("MatrixChatAdapter: Failed to paginate on initial load", e);
          }
      }

      // Return all messages sorted
      const messages = room.getLiveTimeline().getEvents()
          .filter(event => event.getType() === EventType.RoomMessage)
          .map(event => this.toMessageEntity(event))
          .sort((a, b) => a.timestamp - b.timestamp);

      return { messages, hasMore };
  }
}
