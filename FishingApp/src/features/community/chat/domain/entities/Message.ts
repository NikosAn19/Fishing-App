import { MessageStatus } from '../enums/MessageStatus';

/**
 * Core Message entity - Single source of truth
 * Used across all layers
 */
export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: MessageStatus;
  imageUrl?: string;
  isSystem?: boolean;
}

/**
 * Message enriched with sender information
 * Used only in UI layer after fetching user data
 */
export interface MessageWithSender extends Message {
  senderName: string;
  senderAvatar?: string;
}
