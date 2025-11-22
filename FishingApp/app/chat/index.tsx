import React from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { MOCK_CHANNELS } from "../../src/features/chat/data/mockData";
import ChannelItem from "../../src/features/chat/components/ChannelItem";
import { Channel } from "../../src/features/chat/types";

export default function ChannelListScreen() {
  const router = useRouter();

  const handleChannelPress = (channel: Channel) => {
    router.push(`/chat/${channel.id}`);
  };

  const sections = MOCK_CHANNELS.map((group) => ({
    title: group.region,
    data: group.channels,
  }));

  return (
    <View style={styles.container}>
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
        contentContainerStyle={styles.listContent}
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
