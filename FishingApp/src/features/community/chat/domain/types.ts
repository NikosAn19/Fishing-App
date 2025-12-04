// src/features/community/chat/domain/types.ts

export enum MessageStatus {
  Sending = 'sending',
  Sent = 'sent',
  Failed = 'failed',
}

export enum UserAction {
  Chat = 'CHAT',
  Block = 'BLOCK',
  ViewProfile = 'VIEW_PROFILE',
  AddFriend = 'ADD_FRIEND',
}

export interface MessageEntity {
  id: string;
  text: string;
  senderId: string;
  status: MessageStatus;
  timestamp: number;
}

export interface ChatRoomEntity {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: MessageEntity;
  unreadCount: number;
}
