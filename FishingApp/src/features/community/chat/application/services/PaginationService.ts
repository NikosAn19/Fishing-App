import { MatrixClient, MatrixEvent, EventType } from 'matrix-js-sdk';
import { PAGINATION_LIMIT, MAX_PAGINATION_ATTEMPTS } from '../../shared/constants/pagination';

/**
 * Handles pagination logic for Matrix timeline
 * Extracted from adapter to keep it thin
 */
export class PaginationService {
  constructor(private client: MatrixClient) {}

  /**
   * Fetches events from Matrix timeline until target count is reached
   * @param roomId - The Matrix room ID
   * @param targetCount - Target number of message events to fetch
   * @param maxAttempts - Maximum pagination attempts to prevent infinite loops
   * @returns Object containing all events and hasMore flag
   */
  async fetchUntilCount(
    roomId: string,
    targetCount: number = PAGINATION_LIMIT,
    maxAttempts: number = MAX_PAGINATION_ATTEMPTS
  ): Promise<{ events: MatrixEvent[]; hasMore: boolean }> {
    const room = this.client.getRoom(roomId);
    if (!room) {
      return { events: [], hasMore: false };
    }

    const timeline = room.getLiveTimeline();
    let hasMore = true;
    let attempts = 0;

    // Get initial events
    let events = timeline.getEvents();
    let messageEvents = events.filter((e) => e.getType() === EventType.RoomMessage);

    console.log(`PaginationService: Initial state - ${messageEvents.length} messages, ${events.length} total events`);

    // Loop until we have enough messages or run out of history
    while (messageEvents.length < targetCount && hasMore && attempts < maxAttempts) {
      attempts++;
      console.log(`PaginationService: Attempt ${attempts}/${maxAttempts} - Fetching more events...`);

      try {
        const previousCount = events.length;
        hasMore = await this.client.paginateEventTimeline(timeline, {
          backwards: true,
          limit: PAGINATION_LIMIT,
        });

        events = timeline.getEvents();
        messageEvents = events.filter((e) => e.getType() === EventType.RoomMessage);

        console.log(`PaginationService: Fetched ${events.length - previousCount} new events. Total messages: ${messageEvents.length}`);

        // Break if we have enough messages
        if (messageEvents.length >= targetCount) {
          break;
        }
      } catch (error) {
        console.warn('PaginationService: Pagination failed', error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.warn(`PaginationService: Reached max attempts (${maxAttempts})`);
    }

    return { events, hasMore };
  }
}
