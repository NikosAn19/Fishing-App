import { UserStory } from "../types/storyTypes";

export const MOCK_STORIES: UserStory[] = [
  {
    userId: "1",
    username: "nikos_fishing",
    userImage: "https://images.unsplash.com/photo-1534349762230-e0cd4f6d65d3?q=80&w=200&auto=format&fit=crop", // Fisherman portrait
    stories: [
      {
        id: "s1",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=600&auto=format&fit=crop", // Holding a big fish
        timestamp: new Date().toISOString(),
        viewed: false,
      },
      {
        id: "s2",
        imageUrl: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=600&auto=format&fit=crop", // Scenic lake fishing
        timestamp: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    userId: "2",
    username: "maria_sea",
    userImage: "https://images.unsplash.com/photo-1525183995014-bd94c0750cd5?q=80&w=200&auto=format&fit=crop", // Woman profile
    stories: [
      {
        id: "s3",
        imageUrl: "https://images.unsplash.com/photo-1615141982969-13c524a70d1f?q=80&w=600&auto=format&fit=crop", // Fishing boat at sunset
        timestamp: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    userId: "3",
    username: "john_doe",
    userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", // Man profile
    stories: [
      {
        id: "s4",
        imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=600&auto=format&fit=crop", // Fishing gear/lures
        timestamp: new Date().toISOString(),
        viewed: true,
      },
    ],
  },
  {
    userId: "4",
    username: "fishing_pro",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", // Man profile
    stories: [
      {
        id: "s5",
        imageUrl: "https://images.unsplash.com/photo-1520939817895-060bdaf4de1e?q=80&w=600&auto=format&fit=crop", // Underwater fish
        timestamp: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    userId: "5",
    username: "sea_lover",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop", // Woman profile
    stories: [
      {
        id: "s6",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", // Beach fishing scene
        timestamp: new Date().toISOString(),
        viewed: true,
      },
    ],
  },
];
