// src/repositories/index.ts
// This file acts as the Centralized Access Point for all repositories.

// We will import repositories here as we create them.
import { userRepository } from '../features/auth/repositories/UserRepository';
import { ChatRepository } from '../features/community/chat/application/repositories/ChatRepository';
import { ZustandStateAdapter } from '../features/community/chat/infrastructure/adapters/ZustandStateAdapter';
import { MatrixChatAdapter } from '../features/community/chat/infrastructure/adapters/MatrixChatAdapter';
import { matrixService } from '../features/community/chat/matrix/MatrixService';

// Dependency Injection - wire up implementations
const createChatRepository = () => {
  const chatStateAdapter = new ZustandStateAdapter();
  const client = matrixService.auth.getClient();
  
  if (!client) {
    throw new Error('Matrix client not initialized. Please login first.');
  }
  
  const matrixAdapter = new MatrixChatAdapter(client);
  return new ChatRepository(chatStateAdapter, matrixAdapter);
};

// Lazy initialization to ensure Matrix client is ready
let chatRepositoryInstance: ChatRepository | null = null;

export const AppRepository = {
  user: userRepository,
  get chat() {
    if (!chatRepositoryInstance) {
      chatRepositoryInstance = createChatRepository();
    }
    return chatRepositoryInstance;
  },
};
