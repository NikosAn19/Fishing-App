import { NotificationContent } from '../types/NotificationTypes';

// We just need the methods push/replace, so we can define a minimal interface 
// or import the type if available. For now, we'll try to keep it generic.
export interface RouterInterface {
    push: (href: string) => void;
    replace: (href: string) => void;
}

export interface NotificationStrategy<T = any> {
  /**
   * Determine the title, body, and data payload for the notification.
   */
  getContent(payload: T): NotificationContent;

  /**
   * Handle the action when the user taps the notification.
   */
  handleTap(data: Record<string, any>, router: any): void;
}
