import { Message, MessageWithSender } from '../../domain/entities/Message';

/**
 * Maps a Message to MessageWithSender by enriching it with user data
 * @param message - Base message entity
 * @param senderName - Sender's display name
 * @param senderAvatar - Sender's avatar URL (optional)
 * @returns MessageWithSender with enriched user data
 */
export function enrichMessageWithSender(
  message: Message,
  senderName: string,
  senderAvatar?: string
): MessageWithSender {
  return {
    ...message,
    senderName,
    senderAvatar,
  };
}

/**
 * Maps an array of Messages to MessageWithSender array
 * @param messages - Array of base message entities
 * @param getUserData - Function to get user data by senderId
 * @returns Array of MessageWithSender
 */
export function enrichMessagesWithSenders(
  messages: Message[],
  getUserData: (senderId: string) => { name: string; avatar?: string }
): MessageWithSender[] {
  return messages.map((msg) => {
    const userData = getUserData(msg.senderId);
    return enrichMessageWithSender(msg, userData.name, userData.avatar);
  });
}
