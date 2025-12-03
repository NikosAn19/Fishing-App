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
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import UserActionModal from "../components/UserActionModal";
import { Message, DirectMessage } from "../types/chatTypes";
import { BackButton } from "../../../../generic/common/BackButton";

import { matrixService } from "../matrix/MatrixService";
import { useAuthStore } from "../../../auth/stores/authStore";

export default function ChatRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const [matrixStatus, setMatrixStatus] = useState('Αποσυνδεδεμένος');
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const initChat = async () => {
      // Check if client is ready (login handled by authStore)
      if (matrixService.auth.isClientReady()) {
        setMatrixStatus('Συνδέθηκε στο Matrix!');
        
        // Use centralized logic to join/open chat
        const roomId = await matrixService.rooms.joinOrOpenChat(channelId);
        
        if (roomId) {
            console.log('✅ Chat Ready:', roomId);
            setRoomId(roomId);
        } else {
            console.error('❌ Failed to join or create room:', channelId);
            setMatrixStatus('Failed to join room');
        }
      } else {
        setMatrixStatus('Δεν υπάρχει σύνδεση στο Matrix');
      }
    };

    initChat();
  }, [channelId]);
  useEffect(() => {
    if (roomId) {
      // 1. Load initial history
      const initialMessages = matrixService.events.getRoomMessages(roomId);
      setMessages(initialMessages);

      // 2. Subscribe to new messages
      const unsubscribe = matrixService.events.subscribeToRoom(roomId, (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);

  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]); // Start empty, load from Matrix
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [roomName, setRoomName] = useState<string>("Chat");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (roomId) {
      const room = matrixService.rooms.getRoom(roomId);
      if (room) {
        setRoomName(room.name || "Chat");
      }
    } else if (channelId) {
        // Fallback for initial display
        if (channelId.startsWith('#')) {
            setRoomName(channelId.split(':')[0]);
        }
    }
  }, [roomId, channelId]);

  const title = roomName;

  const handleSend = async (text: string) => {
    // Optimistic update
    const tempId = `local-${Date.now()}`;
    const currentUser = useAuthStore.getState().user;
    
    const newMessage: Message = {
      id: tempId,
      text: text,
      senderId: matrixService.auth.getUserId() || "current-user",
      senderName: currentUser?.displayName || "Εγώ",
      senderAvatar: currentUser?.avatarUrl || undefined,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send to Matrix
    if (roomId) {
        try {
            await matrixService.events.sendMessage(roomId, text);
            console.log('✅ Message sent to Matrix');
            // The subscription will handle the "sent" confirmation event 
            // which might replace this optimistic one if IDs match or we handle it
        } catch (e) {
            console.error('❌ Failed to send to Matrix:', e);
            // Optionally mark message as failed in UI
        }
    } else {
        console.warn('⚠️ No Matrix Room ID, message locally only');
    }

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

  const handleAvatarPress = (user: { id: string; name: string; avatar?: string }) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleShowProfile = () => {
    console.log("Show Profile clicked for:", selectedUser);
    handleCloseModal();
  };

  const handleAddFriend = () => {
    console.log("Add Friend clicked for:", selectedUser);
    handleCloseModal();
  };

  const handleSendMessage = async () => {
    if (!selectedUser) return;
    console.log("Send Message clicked for:", selectedUser);
    handleCloseModal();

    // Create or find DM room
    const dmRoomId = await matrixService.rooms.createDirectChat(selectedUser.id);
    if (dmRoomId) {
        // Navigate to the new room
        // We use push to add to stack, so user can go back
        router.push(`/community/chat/${dmRoomId}`);
    } else {
        alert('Failed to start chat');
    }
  };

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
        <View style={{ padding: 10, backgroundColor: colors.secondaryBg, alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Matrix: {matrixStatus}</Text>
      </View>
      <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const currentUserId = matrixService.auth.getUserId();
            return (
              <MessageBubble
                message={item}
                isMe={item.senderId === currentUserId}
                onAvatarPress={handleAvatarPress}
              />
            );
          }}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
        />
        <ChatInput 
          onSend={handleSend} 
          onImagePress={() => console.log("Image button pressed")}
        />
      </KeyboardAvoidingView>

      <UserActionModal
        visible={!!selectedUser}
        onClose={handleCloseModal}
        user={selectedUser}
        onShowProfile={handleShowProfile}
        onSendMessage={handleSendMessage}
      />
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
