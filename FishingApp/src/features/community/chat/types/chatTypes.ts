export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string; // ISO string
  isSystem?: boolean;
  imageUrl?: string;
}

export interface Channel {
  id: string;
  name: string;
  region: string; // e.g., "Macedonia", "Attica"
  category: string; // e.g., "Spinning", "Casting"
  unreadCount?: number;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
}

export interface ChannelGroup {
  region: string;
  channels: Channel[];
}

export interface DirectMessage {
  id: string;
  user: ChatUser;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount?: number;
}
