// src/repositories/index.ts
// This file acts as the Centralized Access Point for all repositories.

// We will import repositories here as we create them.
import { userRepository } from '../features/auth/repositories/UserRepository';
import { chatRepository } from '../features/community/chat/repositories/ChatRepository';

export const AppRepository = {
  user: userRepository,
  chat: chatRepository,
};
