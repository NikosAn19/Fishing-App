import * as Notifications from 'expo-notifications';
import { NotificationStrategy } from './strategies/NotificationStrategy';
import { NotificationType } from './types/NotificationTypes';

class NotificationManager {
  private strategies = new Map<NotificationType, NotificationStrategy>();

  constructor() {
    // Singleton pattern enforced by export
  }

  /**
   * Register a strategy for a specific notification type
   */
  registerStrategy(type: NotificationType, strategy: NotificationStrategy) {
    this.strategies.set(type, strategy);
  }

  /**
   * Request notification permissions
   * Wraps Expo's permission logic
   */
  async ensurePermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      console.log('❌ Notification permissions not granted');
      return false;
    }
    
    return true;
  }

  /**
   * Show a local notification using the appropriate strategy
   */
  async show(type: NotificationType, payload: any) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      console.warn(`NotificationManager: No strategy registered for type ${type}`);
      return;
    }

    try {
      const content = strategy.getContent(payload);
      
      // Merge type into data for hydration later
      const data = { ...content.data, type };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: data,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('NotificationManager: Failed to show notification', error);
    }
  }

  /**
   * Handle user tapping on a notification
   */
  handleNotificationResponse(response: Notifications.NotificationResponse, router: any) {
    const data = response.notification.request.content.data;
    const type = data.type as NotificationType;
    
    // Fallback for legacy pattern (just roomId)
    // If we didn't send 'type', but we have 'roomId', assume Chat.
    if (!type && data.roomId) {
        this.strategies.get(NotificationType.CHAT_MESSAGE)?.handleTap(data, router);
        return;
    }

    const strategy = this.strategies.get(type);
    if (strategy) {
      strategy.handleTap(data, router);
    } else {
        console.warn(`NotificationManager: No strategy found for tap on type ${type}`);
    }
  }
}

export const notificationManager = new NotificationManager();
