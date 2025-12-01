import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Room, RoomEvent, NotificationCountType } from "matrix-js-sdk";
import { colors } from "../../../../theme/colors";
import { matrixService } from "../matrix/MatrixService";

interface RoomListProps {
  filter?: 'direct' | 'channel' | 'all';
}

import { chatApi, PublicChannel } from "../matrix/api/client";

export default function RoomList({ filter = 'all' }: RoomListProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const allMatrixRooms = matrixService.rooms.getSortedRooms();
      let publicChannels: PublicChannel[] = [];
      
      if (filter === 'channel' || filter === 'all') {
          publicChannels = await chatApi.getPublicChannels();
      }
      
      // Map Matrix rooms to a common structure or just use them
      // We need to merge "backend public channels" with "joined matrix rooms"
      
      // 1. Get joined room IDs
      const joinedRoomIds = new Set(allMatrixRooms.map(r => r.roomId));
      
      // 2. Filter Matrix rooms based on props
      const filteredMatrixRooms = allMatrixRooms.filter(room => {
        const isDirect = matrixService.rooms.isDirectChat(room);
        if (filter === 'direct') return isDirect;
        if (filter === 'channel') return !isDirect;
        return true;
      });

      // 3. Create "Room-like" objects for public channels we haven't joined yet
      const unjoinedChannels = publicChannels
        .filter(c => !joinedRoomIds.has(c.matrixRoomId))
        .map(c => ({
            roomId: c.matrixRoomId,
            name: c.name,
            // Mocking Room methods/properties for display
            getLastActiveTimestamp: () => 0,
            timeline: [],
            getAvatarUrl: () => null,
            getUnreadNotificationCount: () => 0,
            isUnjoined: true, // Flag to indicate it's not joined
        } as any as Room));

      // 4. Combine
      // If filter is direct, we only show matrix rooms (assuming backend doesn't list all DMs)
      // If filter is channel or all, we append unjoined channels
      let finalRooms = [...filteredMatrixRooms];
      if (filter !== 'direct') {
          finalRooms = [...finalRooms, ...unjoinedChannels];
      }
      
      // Sort: Joined rooms by activity, then unjoined by name?
      // Or just put unjoined at the bottom
      finalRooms.sort((a, b) => {
          const aTime = a.getLastActiveTimestamp?.() || 0;
          const bTime = b.getLastActiveTimestamp?.() || 0;
          if (aTime !== bTime) return bTime - aTime;
          return (a.name || '').localeCompare(b.name || '');
      });

      setRooms(finalRooms);
      setLoading(false);
    };

    // Initial fetch
    fetchRooms();

    // Subscribe to updates
    const client = matrixService.auth.getClient();
    if (client) {
        const handleTimeline = () => {
            fetchRooms();
        };
        client.on(RoomEvent.Timeline, handleTimeline);
        // Also listen for room join events to update list
        client.on(RoomEvent.MyMembership, fetchRooms);
        
        return () => {
            client.removeListener(RoomEvent.Timeline, handleTimeline);
            client.removeListener(RoomEvent.MyMembership, fetchRooms);
        };
    }
  }, [filter]);

  const handlePress = (roomId: string) => {
    router.push(`/community/chat/${encodeURIComponent(roomId)}`);
  };

  const renderItem = ({ item }: { item: Room }) => {
    const lastEvent = item.getLastActiveTimestamp();
    const lastMessageEvent = item.timeline[item.timeline.length - 1];
    const lastMessageText = lastMessageEvent?.getContent()?.body || "No messages yet";
    const name = item.name || "Unknown Room";
    const avatarUrl = item.getAvatarUrl(matrixService.auth.getClient()?.getHomeserverUrl() || "", 40, 40, "crop");
    const unreadCount = item.getUnreadNotificationCount(NotificationCountType.Total);

    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handlePress(item.roomId)}
        activeOpacity={0.9}
      >
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessageText}
            </Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          {lastEvent && lastEvent > 0 && (
            <Text style={styles.timestamp}>
              {new Date(lastEvent).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          )}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
      return <ActivityIndicator size="small" color={colors.accent} />;
  }

  if (rooms.length === 0) {
      return (
          <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chats found.</Text>
          </View>
      );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.roomId}
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
  emptyContainer: {
      padding: 20,
      alignItems: 'center',
  },
  emptyText: {
      color: colors.textTertiary,
      fontSize: 14,
  }
});
