import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../../theme/colors";
import { MOCK_MESSAGES, MOCK_CHANNELS, MOCK_DIRECT_MESSAGES } from "../data/mockData";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import { Message, DirectMessage } from "../types/chatTypes";
import { BackButton } from "../../../../generic/common/BackButton";

export default function ChatRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Find channel or DM name for header
  const channel = MOCK_CHANNELS.flatMap((g) => g.channels).find(
    (c) => c.id === channelId
  );
  
  const dm = MOCK_DIRECT_MESSAGES.find((d: DirectMessage) => d.id === channelId);

  const title = channel ? `# ${channel.name}` : dm ? dm.user.name : "Chat";

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      senderId: "current-user",
      senderName: "Εγώ",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    // Scroll to bottom on new message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <BackButton onPress={handleBack} style={styles.backButton} />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMe={item.senderId === "current-user"}
            />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  backButton: {
    marginTop: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
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
