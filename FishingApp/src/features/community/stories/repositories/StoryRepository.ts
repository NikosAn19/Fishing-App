import { apiFetchJson } from '../../../../utils/apiClient';
import { UserStory, StoryResponse } from '../types/storyTypes';

export class StoryRepository {
  
  /**
   * Post a new story
   */
  async createStory(mediaUrl: string, mediaType: 'image' | 'video' = 'image'): Promise<void> {
    await apiFetchJson('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaUrl, mediaType })
    });
  }

  /**
   * Get main feed (Friends + Self)
   */
  async getFeed(): Promise<UserStory[]> {
    const feed = await apiFetchJson<UserStory[]>('/api/stories/feed');
    return feed;
  }

  /**
   * Mark story as viewed
   */
  async viewStory(storyId: string): Promise<void> {
    await apiFetchJson(`/api/stories/${storyId}/view`, {
      method: 'POST'
    });
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string): Promise<void> {
    await apiFetchJson(`/api/stories/${storyId}`, {
      method: 'DELETE'
    });
  }
}

export const storyRepository = new StoryRepository();
