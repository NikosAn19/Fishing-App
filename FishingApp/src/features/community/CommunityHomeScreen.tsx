import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import StoriesRow from "./stories/components/StoriesRow";
import { MOCK_STORIES } from "./stories/data/mockData";
import RoomList from "./chat/components/RoomList";
import { AppRepository } from "../../repositories";
import RegionAccordion from "./chat/components/RegionAccordion";
import { useChatStore } from "./chat/infrastructure/state/ChatStore";
// Import PublicChannel type locally or from API if needed for typing, but we are mapping from manually now.
import { PublicChannel } from "./chat/matrix/api/client";

export default function CommunityHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      // Use repository to sync channels (DB + Matrix)
      await AppRepository.chat.syncChannels();
    } catch (error) {
      console.error("Failed to load public channels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelPress = (roomId: string) => {
    router.push(`/community/chat/${encodeURIComponent(roomId)}`);
  };

  const handleStoryPress = (userId: string) => {
    router.push(`/community/stories/${userId}`);
  };

  const handleDirectMessagesPress = () => {
    router.push("/community/direct-messages"); 
  };

  const { rooms } = useChatStore();

  // Group channels by region
  const groupedChannels = React.useMemo(() => {
    const groups: { [key: string]: PublicChannel[] } = {};
    
    // Convert store rooms to array and filter for channels
    const allChannels = Object.values(rooms).filter(r => r.type === 'channel'); // ChatRoomType.CHANNEL literal

    allChannels.forEach(channel => {
      // Parse "Region - Technique"
      const parts = channel.name.split(' - ');
      const regionName = parts.length > 1 ? parts[0] : 'General';
      
      if (!groups[regionName]) {
        groups[regionName] = [];
      }
      
      // Adapt ChatRoom to PublicChannel + unreadCount
      const channelWithUnread = {
         _id: channel.id, // Adaptation
         matrixRoomId: channel.id,
         name: channel.name,
         participants: [], // Not needed for display
         unreadCount: channel.unreadCount || 0
      };
      
      groups[regionName].push(channelWithUnread);
    });

    return Object.entries(groups).map(([regionName, channels]) => ({
      regionName,
      channels
    }));
  }, [rooms]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ paddingTop: insets.top, backgroundColor: colors.primaryBg, zIndex: 10 }}>
        <StoriesRow stories={MOCK_STORIES} onStoryPress={handleStoryPress} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dmContainer}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginBottom: 8 }]}>DIRECT MESSAGES</Text>
          <RoomList filter="direct" />
        </View>

        <View style={styles.regionsContainer}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginBottom: 8, marginTop: 24 }]}>REGIONS</Text>
          {groupedChannels.map((group) => (
            <RegionAccordion 
              key={group.regionName}
              regionName={group.regionName}
              channels={group.channels}
              onChannelPress={handleChannelPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  listContent: {
    paddingBottom: 20,
  },
  dmContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  regionsContainer: {
    paddingHorizontal: 16,
  }
});
