import { ChatErrorCode } from '../enums/ChatErrorCode';

/**
 * Domain-specific error class
 */
export class ChatError extends Error {
  constructor(
    message: string,
    public code: ChatErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ChatError';
  }
}
