import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../../../theme/colors";
import { AppRepository } from "../../../../repositories";
import { ChatRoom } from "../domain/entities/ChatRoom";
import { ChatRoomType } from "../domain/enums/ChatRoomType";

interface RoomListProps {
  filter?: 'direct' | 'channel' | 'all';
}

export default function RoomList({ filter = 'all' }: RoomListProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        
        // Use repository instead of matrixService
        const allRooms = await AppRepository.chat.fetchPublicRooms();
        
        // Filter based on type
        const filtered = filter === 'all' 
          ? allRooms
          : allRooms.filter(room => {
              if (filter === 'direct') return room.type === ChatRoomType.DIRECT;
              if (filter === 'channel') return room.type === ChatRoomType.CHANNEL;
              return true;
            });
        
        setRooms(filtered);
      } catch (error) {
        console.error('Failed to fetch rooms', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    
    // Subscribe to updates using repository
    const unsubscribe = AppRepository.chat.subscribeToRoomUpdates((updatedRooms) => {
      const filtered = filter === 'all'
        ? updatedRooms
        : updatedRooms.filter(room => {
            if (filter === 'direct') return room.type === ChatRoomType.DIRECT;
            if (filter === 'channel') return room.type === ChatRoomType.CHANNEL;
            return true;
          });
      setRooms(filtered);
    });
    
    return unsubscribe;
  }, [filter]);

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
              {item.type === ChatRoomType.CHANNEL ? 'Channel' : 'Direct Message'}
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
