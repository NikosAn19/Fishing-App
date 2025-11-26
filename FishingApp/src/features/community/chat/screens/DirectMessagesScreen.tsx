import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../../theme/colors";
import { BackButton } from "../../../../components/common/BackButton";
import { MOCK_DIRECT_MESSAGES } from "../data/mockData";
import { DirectMessage } from "../types/chatTypes";

export default function DirectMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  const handlePress = (dm: DirectMessage) => {
    // Navigate to chat with this user
    router.push(`/community/chat/${dm.id}`);
  };

  const renderItem = ({ item }: { item: DirectMessage }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => handlePress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.leftContent}>
        <View style={styles.avatarContainer}>
          {item.user.avatarUrl ? (
            <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.user.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || "No messages yet"}
          </Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        {item.lastMessage && (
          <Text style={styles.timestamp}>
            {new Date(item.lastMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        )}
        {item.unreadCount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <BackButton onPress={handleBack} style={styles.backButton} />
        <Text style={styles.headerTitle}>Direct Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK_DIRECT_MESSAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
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
    paddingVertical: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // bg-slate-900/40
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)", // border-slate-800/50
    marginBottom: 8,
    marginHorizontal: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: colors.palette.slate[200],
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  lastMessage: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 40,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  badge: {
    backgroundColor: colors.palette.emerald[500],
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.palette.slate[900],
    fontSize: 10,
    fontWeight: "bold",
  },
});
