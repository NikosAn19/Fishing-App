import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PublicProfileView } from '../../../src/features/profile/components/PublicProfileView';
import { AppRepository } from '../../../src/repositories';
import { colors } from '../../../src/theme/colors';
import { BackButton } from '../../../src/generic/common/BackButton';
import { UserPlus, UserCheck, MessageCircle } from 'lucide-react-native';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';
import { UserAction } from '../../../src/features/community/chat/domain/enums/UserAction';
import { useAlert } from '../../../src/hooks/alerts/useAlert';
import { AlertRegistry } from '../../../src/generic/common/alerts/AlertRegistry';
import { AlertMessage } from '../../../src/generic/common/alerts/messages';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const currentUserId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // If ID is matrix ID, lookup by matrix ID, else get by ID
        let fetchedUser;
        if (id.startsWith('@')) {
             fetchedUser = await AppRepository.user.getUserByMatrixId(id);
        } else {
             fetchedUser = await AppRepository.user.getUserById(id);
        }
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        Alert.alert("Error", "Could not load user profile");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleAddFriend = async () => {
      if (!user) return;
      try {
          // Clean ID
          const cleanUser = { ...user, id: user.id.trim() };
          await AppRepository.user.performUserAction(cleanUser, UserAction.ADD_FRIEND);
          showAlert(AlertRegistry.success(AlertMessage.FRIEND_REQUEST_SENT));
      } catch (e: any) {
          const isConflict = e.message?.includes('already');
           if (!isConflict) {
              console.error(e);
           }
          showAlert(AlertRegistry.get(e));
      }
  };

  const handleSendMessage = async () => {
      if (!user) return;
      try {
          const roomId = await AppRepository.user.performUserAction(user, UserAction.CHAT);
          if (roomId) {
              // Replace current screen with chat to avoid stacking
              router.replace(`/community/chat/${roomId}`);
          }
      } catch (e) {
          console.error(e);
          Alert.alert("Error", "Failed to start chat");
      }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!user) {
      return (
          <View style={styles.loadingContainer}>
              <Text style={{color: colors.textSecondary}}>User not found</Text>
          </View>
      )
  }

  const isSelf = currentUserId === user.id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>
      
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>
      
      <PublicProfileView
        user={user}
        onSendMessage={handleSendMessage}
        onAddFriend={handleAddFriend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50, // Adjust for safe area
    left: 20,
    zIndex: 10,
  },
  actionButtons: {
      flexDirection: 'row',
      gap: 16
  },
  iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border
  }
});
