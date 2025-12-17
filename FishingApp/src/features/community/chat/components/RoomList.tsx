import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { colors } from "../../../../theme/colors";
import { AppRepository } from "../../../../repositories";
import { ChatRoom } from "../domain/entities/ChatRoom";
import { ChatRoomType } from "../domain/enums/ChatRoomType";
import { useChatStore } from "../infrastructure/state/ChatStore";

interface RoomListProps {
  filter?: 'direct' | 'channel' | 'all';
}

export default function RoomList({ filter = 'all' }: RoomListProps) {
  const router = useRouter();
  // CRITICAL: Ensure we use the Store as Single Source of Truth
  const { rooms: roomsMap } = useChatStore();
  const [loading, setLoading] = React.useState(false);

  // Convert map to array and sort
  const rooms = React.useMemo(() => {
     let allRooms = Object.values(roomsMap);
     
     if (filter === 'direct') {
         allRooms = allRooms.filter(r => r.type === ChatRoomType.DIRECT);
     } else if (filter === 'channel') {
         allRooms = allRooms.filter(r => r.type === ChatRoomType.CHANNEL);
     }

     // Sort by last message / activity
     return allRooms.sort((a, b) => {
         const timeA = a.lastMessage?.timestamp || 0;
         const timeB = b.lastMessage?.timestamp || 0;
         // TODO: Add lastActive timestamp to Room entity for better sorting
         return timeB - timeA;
     });
  }, [roomsMap, filter]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const syncRooms = async () => {
        try {
          if (rooms.length === 0) setLoading(true);

          // Parallel Sync (Safe due to setRoomsByType)
          const promises = [];
          if (filter === 'direct' || filter === 'all') {
               promises.push(AppRepository.chat.syncDirectMessages());
          }
          if (filter === 'channel' || filter === 'all') {
               promises.push(AppRepository.chat.syncChannels());
          }
          
          await Promise.all(promises);

        } catch (error) {
          console.error('Failed to sync rooms', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      syncRooms();
      
      return () => {
        isActive = false;
      };
    }, [filter]) 
  );

  const handlePress = (roomId: string) => {
    router.push(`/community/chat/${encodeURIComponent(roomId)}`);
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handlePress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.text || (item.type === ChatRoomType.CHANNEL ? 'Channel' : 'Direct Message')}
            </Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && rooms.length === 0) {
    return <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />;
  }

  if (rooms.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chats found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
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
    justifyContent: "center",
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 14,
  }
});
