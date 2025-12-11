import { notificationManager } from './NotificationManager';
import { ChatMessageStrategy } from './strategies/ChatMessageStrategy';
import { FriendRequestStrategy } from './strategies/FriendRequestStrategy';
import { NotificationType } from './types/NotificationTypes';

export * from './NotificationManager';
export * from './types/NotificationTypes';
export * from './strategies/NotificationStrategy';
export * from './strategies/ChatMessageStrategy';
export * from './strategies/FriendRequestStrategy';

export function initializeNotificationStrategies() {
  notificationManager.registerStrategy(
    NotificationType.CHAT_MESSAGE,
    new ChatMessageStrategy()
  );
  notificationManager.registerStrategy(
    NotificationType.FRIEND_REQUEST,
    new FriendRequestStrategy()
  );
  console.log('✅ Notification Strategies Initialized');
}
