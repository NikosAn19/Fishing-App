import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

export const NotificationService = {
  /**
   * Send a push notification to a specific user token
   */
  sendPushNotification: async (pushToken: string, title: string, body: string, data: Record<string, unknown> = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [];
    messages.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    });

    try {
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log('Notification sent, tickets:', ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }
      
      return tickets;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  }
};
