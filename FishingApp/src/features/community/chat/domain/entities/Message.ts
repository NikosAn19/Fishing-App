import { MessageStatus } from '../enums/MessageStatus';
import { MessageAttachment } from './MessageAttachment';

/**
 * Core message entity
 * Supports text-only, media-only, or combined messages (Instagram/Messenger style)
 */
export interface Message {
  id: string;
  senderId: string;
  status: MessageStatus;
  timestamp: number;
  
  // Text content (optional - can be empty for media-only messages)
  text?: string;
  
  // Media attachments (optional - can have 0, 1, or many)
  attachments?: MessageAttachment[];
}

/**
 * Message with sender information (for UI display)
 */
export interface MessageWithSender extends Message {
  senderName: string;
  senderAvatar?: string;
  imageUrl?: string; // Deprecated: use attachments instead
}

// Re-export attachment types for convenience
export * from './MessageAttachment';
