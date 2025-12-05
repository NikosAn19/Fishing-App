import { MatrixEvent } from 'matrix-js-sdk';

export type EventHandler = (event: MatrixEvent, roomId: string) => void;

/**
 * Registry for Matrix event handlers
 * Makes it easy to add new event types
 */
export class EventHandlerRegistry {
  private handlers = new Map<string, EventHandler[]>();

  /**
   * Register a handler for a specific event type
   * @param eventType - Matrix event type (e.g., 'm.room.message')
   * @param handler - Handler function
   */
  register(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Handle an event by calling all registered handlers for its type
   * @param event - Matrix event
   * @param roomId - Room ID where the event occurred
   */
  handle(event: MatrixEvent, roomId: string): void {
    const eventType = event.getType();
    const handlers = this.handlers.get(eventType) || [];
    
    handlers.forEach((handler) => {
      try {
        handler(event, roomId);
      } catch (error) {
        console.error(`EventHandlerRegistry: Handler failed for ${eventType}`, error);
      }
    });
  }

  /**
   * Unregister a handler for a specific event type
   * @param eventType - Matrix event type
   * @param handler - Handler function to remove
   */
  unregister(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Clear all handlers for a specific event type
   * @param eventType - Matrix event type
   */
  clearHandlers(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Clear all registered handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}
