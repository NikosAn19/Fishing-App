import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { UserStory } from '../types/storyTypes';
import { storyRepository } from '../repositories/StoryRepository';

export const useStories = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      const feed = await storyRepository.getFeed();
      setStories(feed);
    } catch (error) {
      console.error('Failed to fetch stories', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [])
  );
  
  const refreshStories = () => {
      setLoading(true);
      fetchStories();
  };

  return { stories, loading, refreshStories };
};
