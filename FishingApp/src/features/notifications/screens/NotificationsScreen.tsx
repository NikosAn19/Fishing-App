import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../theme/colors";
import { BackButton } from "../../../generic/common/BackButton";
import { useAuthStore } from "../../auth/stores/authStore";
import { Friend } from "../../auth/types/authTypes";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleAccept = async (requesterId: string) => {
      if (!accessToken) return;
      setLoading(true);
      try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friends/accept`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ requesterId })
          });
          
          if (response.ok) {
              await refreshUser();
          } else {
              console.error('Failed to accept request');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDecline = async (requesterId: string) => {
      if (!accessToken) return;
      setLoading(true);
      try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friends/reject`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ requesterId })
          });
          
          if (response.ok) {
              await refreshUser();
          } else {
              console.error('Failed to reject request');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const pendingRequests = user?.friends?.filter(f => f.status === 'pending') || [];

  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.itemContainer}>
      <View style={styles.userInfo}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.displayName}</Text>
          <Text style={styles.subtext}>Sent you a friend request</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
            style={[styles.button, styles.acceptButton]} 
            onPress={() => handleAccept(item.id)}
            disabled={loading}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.button, styles.declineButton]}
            onPress={() => handleDecline(item.id)}
            disabled={loading}
        >
          <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <BackButton onPress={handleBack} style={styles.backButton} />
        <Text style={styles.headerTitle}>Ειδοποιήσεις</Text>
        <View style={{ width: 40 }} />
      </View>

      {pendingRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No new notifications</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginTop: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: colors.secondaryBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "bold",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  subtext: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: colors.accent,
  },
  declineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  declineText: {
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 16,
  },
});
