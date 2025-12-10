/**
 * Centralized Configuration for Matrix Integration
 * Used by MatrixAuthManager (Auth) and MatrixChatAdapter (Data)
 */

import { SaveFormat } from 'expo-image-manipulator';

// 1. CONSTANTS
export const MATRIX_CONSTANTS = {
  BATCH_SIZE: 30,
  MAX_IMAGE_WIDTH: 1920,
  IMAGE_COMPRESSION_QUALITY: 0.7,
  COMPRESSION_FORMAT: SaveFormat.JPEG,
} as const;

// 2. FILTER DEFINITIONS
// Standard filter to only fetch what we need
export const CHAT_FILTER_DEFINITION = {
  room: {
    timeline: {
      limit: MATRIX_CONSTANTS.BATCH_SIZE,
      types: ['m.room.message'], // Only fetch messages (text, image, video, etc.)
    },
    state: {
      types: [
        'm.room.member',       // For sender names and avatars
        'm.room.name',         // For room titles
        'm.room.avatar',       // For room avatars
        'm.room.canonical_alias',
        'm.room.create',
        'm.room.join_rules',
        'm.room.power_levels',
      ],
    },
  },
};
