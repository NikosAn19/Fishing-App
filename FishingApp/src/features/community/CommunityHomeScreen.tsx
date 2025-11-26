import React from "react";
import { View, Text, StyleSheet, SectionList, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { MOCK_CHANNELS } from "./chat/data/mockData";
import ChannelItem from "./chat/components/ChannelItem";
import { Channel } from "./chat/types/chatTypes";
import StoriesRow from "./stories/components/StoriesRow";
import { MOCK_STORIES } from "./stories/data/mockData";
import DirectMessagesButton from "./chat/components/DirectMessagesButton";

export default function CommunityHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleChannelPress = (channel: Channel) => {
    router.push(`/community/chat/${channel.id}`);
  };

  const handleStoryPress = (userId: string) => {
    // Navigate to story viewer
    router.push(`/community/stories/${userId}`);
  };

  const handleDirectMessagesPress = () => {
    // Navigate to direct messages screen
    router.push("/community/direct-messages"); 
  };

  const sections = MOCK_CHANNELS.map((group) => ({
    title: group.region,
    data: group.channels,
  }));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ paddingTop: insets.top, backgroundColor: colors.primaryBg, zIndex: 10 }}>
        <StoriesRow stories={MOCK_STORIES} onStoryPress={handleStoryPress} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChannelItem channel={item} onPress={handleChannelPress} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.dmContainer}>
            <DirectMessagesButton onPress={handleDirectMessagesPress} unreadCount={3} />
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 } // Increased padding for clear display above bottom menu
        ]}
        stickySectionHeadersEnabled={false}
      />
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
});
