export interface Story {
  id: string;
  imageUrl: string;
  timestamp: string;
  viewed: boolean;
  duration?: number; // Duration in seconds, default to 5
}

export interface UserStory {
  userId: string;
  username: string;
  userImage: string;
  stories: Story[];
}
