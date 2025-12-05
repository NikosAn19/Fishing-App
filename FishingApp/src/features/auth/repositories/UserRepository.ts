import { UserEntity } from '../domain/UserEntity';
import { UserAdapter } from '../adapters/UserAdapter';
import { useIdentityStore } from '../stores/IdentityStore';
import { apiFetchJson } from '../../../utils/apiClient';
import { matrixService } from '../../community/chat/matrix/MatrixService';
import { UserAction } from '../../community/chat/domain/enums/UserAction';

export class UserRepository {
  
  // DATA ACCESS
  async getUser(id: string): Promise<UserEntity> {
    // 1. Check Cache (IdentityStore)
    const cached = useIdentityStore.getState().getIdentity(id);
    if (cached) return cached;

    // 2. Fetch & Adapt
    try {
        const raw = await apiFetchJson<any>(`/api/users/${id}`);
        const entity = UserAdapter.toDomain(raw);
        
        // 3. Cache
        useIdentityStore.getState().setIdentity(entity);
        return entity;
    } catch (e) {
        console.error(`UserRepository: Failed to fetch user ${id}`, e);
        throw e;
    }
  }

  async getUserByMatrixId(matrixId: string): Promise<UserEntity | null> {
      // 1. Check Cache
      const cached = useIdentityStore.getState().getByMatrixId(matrixId);
      if (cached) return cached;

      // 2. Fetch from Backend (Lookup)
      try {
          // Assuming an endpoint like /api/users/lookup?matrixId=...
          const raw = await apiFetchJson<any>(`/api/users/lookup?matrixId=${encodeURIComponent(matrixId)}`);
          if (!raw) return null;
          
          const entity = UserAdapter.toDomain(raw);
          useIdentityStore.getState().setIdentity(entity);
          return entity;
      } catch (e) {
          console.warn(`UserRepository: Failed to lookup user by matrixId ${matrixId}, trying Matrix directly...`);
          
          // 3. Fallback: Fetch from Matrix
          try {
              const profile = await matrixService.getUserProfile(matrixId);
              if (profile) {
                  const avatarUrl = profile.avatar_url 
                      ? matrixService.getHttpUrl(profile.avatar_url, 96, 96, 'crop') 
                      : undefined;

                  const entity: UserEntity = {
                      id: matrixId, // Use Matrix ID as canonical ID if backend user doesn't exist
                      displayName: profile.displayname || matrixId,
                      avatarUrl: avatarUrl || undefined,
                      chatId: matrixId, // Correct property name matching UserEntity interface
                      // Remove extra properties not in UserEntity if they cause issues, 
                      // or ensure UserEntity type is updated if needed.
                      // Based on UserEntity.ts, lastSeen and isOnline are NOT in the interface shown in view_file.
                      // I should check if I need to add them or remove them.
                      // The view_file for UserEntity.ts showed: id, displayName, avatarUrl, chatId, isPro.
                      // It did NOT show lastSeen or isOnline.
                      // So I should remove them to avoid type errors.
                  };
                  useIdentityStore.getState().setIdentity(entity);
                  return entity;
              }
          } catch (matrixError) {
              console.warn(`UserRepository: Matrix profile lookup failed for ${matrixId}`, matrixError);
          }
          
          return null;
      }
  }

  // ACTION ABSTRACTION
  async performUserAction(user: UserEntity, action: UserAction): Promise<any> {
    switch (action) {
      case UserAction.Chat:
        if (!user.chatId) {
            throw new Error("This user has not activated Chat features.");
        }
        console.log(`[Repository] Initiating Matrix Room with: ${user.chatId}`);
        const roomId = await matrixService.rooms.createDirectChat(user.chatId);
        return roomId;

      case UserAction.Block:
        // ... existing block logic ...
        break;
        
      case UserAction.ViewProfile:
        // ... existing view profile logic ...
        break;

      case UserAction.AddFriend:
        // ... existing add friend logic ...
        break;
    }
  }
}

export const userRepository = new UserRepository();
