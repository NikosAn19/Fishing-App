import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { MOCK_MESSAGES, MOCK_CHANNELS } from "../../src/features/chat/data/mockData";
import MessageBubble from "../../src/features/chat/components/MessageBubble";
import ChatInput from "../../src/features/chat/components/ChatInput";
import { Message } from "../../src/features/chat/types";

export default function ChatRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Find channel name for header
  const channelName = MOCK_CHANNELS.flatMap((g) => g.channels).find(
    (c) => c.id === channelId
  )?.name;

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: "me",
      senderName: "Εγώ",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    // Scroll to bottom on new message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: channelName ? `# ${channelName}` : "Chat" }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={insets.top + 50}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMe={item.senderId === "me"} />
          )}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
        />
        <ChatInput 
          onSend={handleSend} 
          onImagePress={() => console.log("Image button pressed")}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  flatList: {
    flex: 1,
  },
});
