export interface Story {
  _id: string; // MongoDB ID
  user: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number;
  createdAt: string;
  expiresAt: string;
  views: Array<{ user: string; viewedAt: string }>;
}

export interface UserStory {
  userId: string;
  username: string;
  userImage: string;
  latestStoryAt: string;
  isMe: boolean;
  allViewed: boolean;
  stories: Story[];
}

export interface CreateStoryPayload {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    duration?: number;
}
