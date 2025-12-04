# ARCHITECTURE DESIGN DOCUMENT: User & Communication Abstraction Layer
# Project: Psaraki App
# Date: December 2025

--------------------------------------------------------------------------------
1. OVERVIEW & OBJECTIVE
--------------------------------------------------------------------------------
The goal of this architecture is to decouple the UI (React Native Screens) from 
the underlying data sources (Node.js API, Matrix Chat Server). 

We aim to establish a "Single Source of Truth" for the Frontend. The UI should 
handle a single User Entity object and perform abstract actions (e.g., "Start Chat"), 
without needing to know whether to use a Server UUID or a Matrix ID.

We will achieve this using a combination of three patterns:
1. Domain Entities (The pure data model)
2. Adapter Pattern (Data translation/sanitization)
3. Repository Pattern (The logic/decision layer)

--------------------------------------------------------------------------------
2. ARCHITECTURAL LAYERS
--------------------------------------------------------------------------------

[UI / Screens] 
      ⬇
[Repository Layer] <--- (Decides which ID/Service to use)
      ⬇
[Adapter Layer]    <--- (Standardizes incoming data)
      ⬇
[Data Sources]     (Node.js API / Matrix SDK / Local Storage)


--------------------------------------------------------------------------------
3. IMPLEMENTATION GUIDE (INDICATIVE EXAMPLES)
--------------------------------------------------------------------------------
IMPORTANT: The code below is INDICATIVE. It demonstrates the structural pattern 
and logic flow. Actual implementation details (types, specific API calls, 
error handling) will depend on the final production environment.

### STEP A: The Domain Entity (Model)
This is how the rest of the app "sees" a user. It hides the complexity of 
backend naming conventions.

// file: src/domain/entities/UserEntity.ts
export interface UserEntity {
  id: string;          // The Master UUID (from Node.js DB)
  displayName: string; // The UI-friendly name
  avatarUrl: string;   // Profile picture
  
  // Encapsulated Details (The UI generally doesn't need to read these directly)
  chatId: string | null; // The Matrix ID (@user:matrix.psaraki.gr)
  isPro: boolean;        // Subscription status
}


### STEP B: The Adapter (The Translator)
This layer converts "dirty" API data into our clean "UserEntity". 
It centralizes data parsing logic.

// file: src/data/adapters/UserAdapter.ts
import { UserEntity } from '../../domain/entities/UserEntity';

export class UserAdapter {
  /**
   * Transforms raw API response to Domain Entity.
   * @param rawData - The JSON response from Node.js
   */
  static toDomain(rawData: any): UserEntity {
    return {
      id: rawData.uuid, // Mapping 'uuid' to 'id'
      displayName: rawData.username || 'Anonymous Angler',
      avatarUrl: rawData.profile_picture || 'https://psaraki.gr/default.png',
      
      // LOGIC: Extracting the Matrix ID from the nested metadata object
      chatId: rawData.matrix_meta?.user_id || null,
      
      isPro: rawData.subscription_status === 'active'
    };
  }
}


### STEP C: The Repository (The Abstraction Manager)
This is the most critical part. It acts as a Facade. The UI asks this layer 
to perform actions, and this layer decides which ID (Server vs Matrix) is required.

// file: src/data/repositories/UserRepository.ts
import { UserEntity } from '../../domain/entities/UserEntity';
import { UserAdapter } from '../adapters/UserAdapter';
import { apiService } from '../services/api';     // Your Axios instance
import { matrixService } from '../services/chat'; // Your Matrix SDK instance

export class UserRepository {

  // FETCHING DATA
  async getUserProfile(userId: string): Promise<UserEntity> {
    try {
      const response = await apiService.get(`/users/${userId}`);
      // The repository uses the Adapter to clean the data before returning it
      return UserAdapter.toDomain(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      throw error;
    }
  }

  // PERFORMING ABSTRACT ACTIONS (The Logic Hub)
  async performUserAction(user: UserEntity, action: 'CHAT' | 'VIEW_PROFILE' | 'BLOCK') {
    
    switch (action) {
      case 'VIEW_PROFILE':
        // For profiles, we rely on the Server ID (UUID)
        console.log(`[Repository] Navigating to profile: ${user.id}`);
        // Navigation service call would go here...
        break;

      case 'CHAT':
        // For chat, we automatically switch to the Matrix ID
        if (!user.chatId) {
          throw new Error("This user has not activated Chat features.");
        }
        console.log(`[Repository] Initiating Matrix Room with: ${user.chatId}`);
        await matrixService.createRoom({ invite: [user.chatId] });
        break;

      case 'BLOCK':
        // Example: Blocking might require blocking BOTH on Server and Matrix
        await apiService.post(`/block/${user.id}`);
        if (user.chatId) await matrixService.ignoreUser(user.chatId);
        break;
    }
  }
}

// Export a singleton or instance based on your DI preference
export const userRepository = new UserRepository();


--------------------------------------------------------------------------------
4. USAGE IN FRONTEND (REACT NATIVE)
--------------------------------------------------------------------------------
Notice how the Component does not know about "Matrix" or "UUIDs". 
It only deals with the UserEntity and the Action.

// file: src/screens/UserProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { userRepository } from '../data/repositories/UserRepository';
import { UserEntity } from '../domain/entities/UserEntity';

const UserProfileScreen = ({ route }) => {
  const { userId } = route.params; // This is the UUID passed from navigation
  const [user, setUser] = useState<UserEntity | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await userRepository.getUserProfile(userId);
    setUser(data);
  };

  const handleChatPress = async () => {
    if (!user) return;
    
    // ABSTRACT CALL: We don't care about Matrix IDs here.
    // The repository handles the complexity.
    try {
      await userRepository.performUserAction(user, 'CHAT');
    } catch (e) {
      alert(e.message);
    }
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>{user.displayName}</Text>
      <Button title="Send Message" onPress={handleChatPress} />
    </View>
  );
};

--------------------------------------------------------------------------------
5. BENEFITS OF THIS STRUCTURE
--------------------------------------------------------------------------------
1. Decoupling: If we switch from Matrix to Firebase, we only update the 
   `UserRepository` logic. The UI code remains untouched.
2. Safety: The UI never handles raw API data, preventing undefined errors.
3. Scalability: We can add complex logic (e.g., caching, offline mode) inside 
   the Repository without breaking the app.