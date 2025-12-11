export enum NotificationType {
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
}

export interface NotificationContent {
  title: string;
  body: string;
  data: Record<string, any>;
}
