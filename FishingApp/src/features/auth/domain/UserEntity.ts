// src/features/auth/domain/UserEntity.ts

export interface UserEntity {
  id: string;          // Canonical Server ID (Mongo UUID)
  displayName: string;
  avatarUrl?: string;
  
  // Encapsulated Details (Hidden from UI logic usually)
  chatId: string | null; // Matrix ID (@user:server)
  
  // Optional: Add other profile fields as needed
  isPro?: boolean;
}
