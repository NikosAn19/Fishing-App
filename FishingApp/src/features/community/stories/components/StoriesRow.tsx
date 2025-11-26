import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "../../../../theme/colors";
import { UserStory } from "../types/storyTypes";
import StoryCircle from "./StoryCircle";

interface StoriesRowProps {
  stories: UserStory[];
  onStoryPress: (userId: string) => void;
}

export default function StoriesRow({ stories, onStoryPress }: StoriesRowProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add "Your Story" placeholder if needed, for now just list */}
        {stories.map((userStory) => (
          <StoryCircle
            key={userStory.userId}
            userStory={userStory}
            onPress={() => onStoryPress(userStory.userId)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.slate[800],
    backgroundColor: colors.primaryBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
