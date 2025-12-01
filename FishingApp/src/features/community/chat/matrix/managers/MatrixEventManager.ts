import { MatrixClient, EventType, MsgType, RoomEvent, MatrixEvent } from 'matrix-js-sdk';
import { Message } from '../../types/chatTypes';
import { EventMapper } from '../utils/EventMapper';

export class MatrixEventManager {
  private getClient: () => MatrixClient | null;

  constructor(getClient: () => MatrixClient | null) {
    this.getClient = getClient;
  }

  /**
   * Fetches the timeline messages for a given room from the store.
   */
  public getRoomMessages(roomId: string): Message[] {
    const client = this.getClient();
    if (!client) return [];

    const room = client.getRoom(roomId);
    if (!room) return [];

    // Get live timeline events
    const events = room.getLiveTimeline().getEvents();

    // Map to our Message type
    return events
      .map(event => EventMapper.fromMatrixEvent(event))
      .filter((msg): msg is Message => msg !== null);
  }

  /**
   * Subscribes to new timeline events in a specific room.
   * Returns a cleanup function to unsubscribe.
   */
  public subscribeToRoom(roomId: string, callback: (msg: Message) => void): () => void {
    const client = this.getClient();
    if (!client) return () => {};

    const handler = (event: MatrixEvent, room: any) => {
      if (!room || room.roomId !== roomId) return;
      
      // Only handle new events (not pagination)
      const status = (event as any).getStatus ? (event as any).getStatus() : (event as any).status;
      if (status === null || status === 'sent') { // 'sent' or null (incoming)
          const msg = EventMapper.fromMatrixEvent(event);
          if (msg) {
            callback(msg);
          }
      }
    };

    client.on(RoomEvent.Timeline, handler);

    return () => {
      client.removeListener(RoomEvent.Timeline, handler);
    };
  }

  /**
   * Sends a text message to a room.
   */
  public async sendMessage(roomId: string, content: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      await client.sendEvent(roomId, EventType.RoomMessage, {
        msgtype: MsgType.Text,
        body: content,
      }, "");
    } catch (error) {
      console.error(`❌ MatrixEventManager: Failed to send message to ${roomId}`, error);
      throw error;
    }
  }

  /**
   * Sends an image to a room.
   * (Placeholder for future implementation)
   */
  public async sendImage(roomId: string, url: string, info: any): Promise<void> {
    // Implementation for image uploading and sending
    console.warn('MatrixEventManager: sendImage not implemented yet');
  }
}
