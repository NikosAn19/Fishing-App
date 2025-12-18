import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../../theme/colors";
import StoryReplyInput from "../components/StoryReplyInput";
import { MOCK_STORIES } from "../data/mockData";
import { Story } from "../types/storyTypes";

const { width, height } = Dimensions.get("window");

export default function StoryScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const insets = useSafeAreaInsets();
  
  const userStory = MOCK_STORIES.find((s) => s.userId === userId);
  
  if (!userStory) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Story not found</Text>
      </View>
    );
  }

  const stories = userStory.stories;
  const currentStory = stories[currentStoryIndex];

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Could navigate to previous user's story here if implemented
      setCurrentStoryIndex(0);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      console.log(`Sending reply to ${userStory.username}: ${inputText}`);
      setInputText("");
      // In a real app, this would send a message
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      
      {/* Story Image */}
      <Image
        source={{ uri: currentStory.mediaUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Overlay Gradient for text readability */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
      />

      {/* Touch Layers for Navigation */}
      <View style={styles.touchLayer} pointerEvents="box-none">
        <TouchableOpacity style={styles.touchLeft} onPress={handlePrev} />
        <TouchableOpacity style={styles.touchRight} onPress={handleNext} />
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex1}
        pointerEvents="box-none"
        keyboardVerticalOffset={0}
      >
          {/* Progress Bars */}
          <View style={[styles.progressContainer, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
            {stories.map((story, index) => (
              <View key={story._id} style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? "50%" : "0%", // Static 50% for current for now
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={{ uri: userStory.userImage }} style={styles.userImage} />
              <Text style={styles.username}>{userStory.username}</Text>
              <Text style={styles.time}>2h</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} pointerEvents="none" />

          {/* Footer / Input */}
          <StoryReplyInput 
            onSend={(text) => {
              console.log(`Sending reply to ${userStory.username}: ${text}`);
              // Mock send
            }}
          />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    width: width,
    height: height,
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    width: width,
    height: height,
  },
  flex1: {
    flex: 1,
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  touchLeft: {
    flex: 1,
  },
  touchRight: {
    flex: 2,
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  username: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  time: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
});
