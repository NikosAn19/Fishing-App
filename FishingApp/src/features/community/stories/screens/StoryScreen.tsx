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
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../../theme/colors";
import { MOCK_STORIES } from "../data/mockData";
import { Story } from "../types/storyTypes";

const { width, height } = Dimensions.get("window");

export default function StoryScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  
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
        source={{ uri: currentStory.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Overlay Gradient for text readability */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((story, index) => (
            <View key={story.id} style={styles.progressBarBackground}>
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

        {/* Navigation Taps */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navSide} onPress={handlePrev} />
          <TouchableOpacity style={styles.navSide} onPress={handleNext} />
        </View>

        {/* Footer / Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.footer}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Send message"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={inputText}
              onChangeText={setInputText}
            />
            {inputText.length > 0 ? (
              <TouchableOpacity onPress={handleSend}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={28} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
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
  navigationContainer: {
    flex: 1,
    flexDirection: "row",
  },
  navSide: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.0)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  sendText: {
    color: "white",
    fontWeight: "600",
  },
});
