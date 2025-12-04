// src/features/auth/adapters/UserAdapter.ts
import { UserEntity } from '../domain/UserEntity';

export class UserAdapter {
  /**
   * Transforms raw API response to Domain Entity.
   * @param rawData - The JSON response from Node.js or Matrix
   */
  static toDomain(rawData: any): UserEntity {
    return {
      id: rawData.id || rawData._id || rawData.uuid, // Handle various ID fields
      displayName: rawData.displayName || rawData.name || rawData.username || 'Anonymous Angler',
      avatarUrl: rawData.avatarUrl || rawData.profile_picture,
      
      // LOGIC: Extracting the Matrix ID
      // It might be nested in 'matrix' object or 'matrix_meta' depending on API
      chatId: rawData.matrix?.userId || rawData.matrix_meta?.user_id || null,
      
      isPro: rawData.subscription_status === 'active'
    };
  }
}
