import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../../theme/colors";
import { UserStory } from "../types/storyTypes";

interface StoryCircleProps {
  userStory: UserStory;
  onPress: () => void;
}

export default function StoryCircle({ userStory, onPress }: StoryCircleProps) {
  const hasUnseen = userStory.stories.some((s) => !s.viewed);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.borderContainer}>
        {hasUnseen ? (
          <LinearGradient
            colors={[colors.palette.emerald[400], colors.palette.teal[400]]}
            style={styles.gradientBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: userStory.userImage }} style={styles.image} />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.gradientBorder, styles.seenBorder]}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: userStory.userImage }} style={styles.image} />
            </View>
          </View>
        )}
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {userStory.username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
    width: 72,
  },
  borderContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 4,
  },
  gradientBorder: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    padding: 2, // Border width
    alignItems: "center",
    justifyContent: "center",
  },
  seenBorder: {
    backgroundColor: colors.palette.slate[700],
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: colors.primaryBg, // Gap between border and image
    padding: 2, // Gap width
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: colors.palette.slate[800],
  },
  username: {
    color: colors.textPrimary,
    fontSize: 11,
    textAlign: "center",
    width: "100%",
  },
});
