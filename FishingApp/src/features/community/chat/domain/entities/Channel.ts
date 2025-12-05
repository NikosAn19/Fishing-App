/**
 * Channel entity - represents a chat channel
 */
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

/**
 * Channel group - groups channels by region
 */
export interface ChannelGroup {
  region: string;
  channels: Channel[];
}
