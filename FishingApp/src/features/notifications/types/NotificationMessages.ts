export enum NotificationMessage {
  // Chat
  CHAT_TEXT = "Sent a message",
  CHAT_IMAGE = "📷 Sent an image",
  CHAT_VIDEO = "🎥 Sent a video", 
  CHAT_ATTACHMENT = "📎 Sent an attachment",

  // Friend Requests
  FRIEND_REQUEST_TITLE = "New Friend Request",
  FRIEND_REQUEST_BODY = "{name} wants to be a friend!",
  
  // Errors
  PUSH_TOKEN_ERROR = "Failed to get push token for push notification!"
}
