// src/features/auth/stores/IdentityStore.ts
import { create } from 'zustand';
import { UserEntity } from '../domain/UserEntity';

interface IdentityState {
  identities: Record<string, UserEntity>; // Keyed by Server ID
  matrixMapping: Record<string, string>;    // Matrix ID -> Server ID
  
  // Actions
  setIdentity: (user: UserEntity) => void;
  getIdentity: (serverId: string) => UserEntity | undefined;
  getByMatrixId: (matrixId: string) => UserEntity | undefined;
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  identities: {},
  matrixMapping: {},

  setIdentity: (user) => set((state) => {
    const newMapping = { ...state.matrixMapping };
    if (user.chatId) {
      newMapping[user.chatId] = user.id;
    }
    return {
      identities: { ...state.identities, [user.id]: user },
      matrixMapping: newMapping,
    };
  }),

  getIdentity: (id) => get().identities[id],
  
  getByMatrixId: (mid) => {
    const serverId = get().matrixMapping[mid];
    return serverId ? get().identities[serverId] : undefined;
  }
}));
