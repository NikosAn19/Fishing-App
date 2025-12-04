import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../../theme/colors";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import UserActionModal from "../components/UserActionModal";
import { BackButton } from "../../../../generic/common/BackButton";

import { matrixService } from "../matrix/MatrixService";
import { useIdentityStore } from "../../../auth/stores/IdentityStore";
import { AppRepository } from "../../../../repositories";
import { useChatStore } from "../stores/ChatStore";

const EMPTY_ARRAY: any[] = [];

export default function ChatRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const [matrixStatus, setMatrixStatus] = useState('Αποσυνδεδεμένος');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Repository State
  const messages = useChatStore(state => roomId ? (state.messages[roomId] || EMPTY_ARRAY) : EMPTY_ARRAY);
  const matrixMapping = useIdentityStore(state => state.matrixMapping);
  const identities = useIdentityStore(state => state.identities);
  
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [roomName, setRoomName] = useState<string>("Chat");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  // 1. Initialize Chat Room
  useEffect(() => {
    const initChat = async () => {
      if (matrixService.auth.isClientReady()) {
        setMatrixStatus('Συνδέθηκε στο Matrix!');
        
        const id = await AppRepository.chat.joinRoom(channelId);
        
        if (id) {
            console.log('✅ Chat Ready:', id);
            setRoomId(id);
        } else {
            console.error('❌ Failed to join or create room:', channelId);
            setMatrixStatus('Failed to join room');
            setIsLoading(false);
        }
      } else {
        setMatrixStatus('Δεν υπάρχει σύνδεση στο Matrix');
        setIsLoading(false);
      }
    };

    initChat();
  }, [channelId]);

  // 2. Load & Subscribe to Messages
  useEffect(() => {
    if (roomId) {
      // Load initial history
      const load = async () => {
          await AppRepository.chat.loadMessages(roomId);
          setIsLoading(false);
      };
      load();

      // Subscribe to new messages
      const unsubscribe = AppRepository.chat.subscribeToRoom(roomId);

      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);




  // Momentum Scroll Lock
  const canLoadMore = useRef(false);

  // 2.5 Fetch Missing Identities
  useEffect(() => {
      const fetchMissing = async () => {
          const missingIds = new Set<string>();
          messages.forEach(msg => {
              // Check if we have a mapping for this Matrix ID
              if (!matrixMapping[msg.senderId]) {
                  missingIds.add(msg.senderId);
              }
          });

          if (missingIds.size > 0) {
              console.log('Fetching missing identities:', Array.from(missingIds));
              // Fetch sequentially or parallel
              for (const mid of missingIds) {
                  // This will automatically update IdentityStore
                  await AppRepository.user.getUserByMatrixId(mid);
              }
          }
      };
      
      if (messages.length > 0) {
          fetchMissing();
      }
  }, [messages.length, matrixMapping]); // Run when messages change or mapping changes

  // 3. Update Room Name
  useEffect(() => {
    if (roomId) {
      const room = matrixService.rooms.getRoom(roomId);
      if (room) {
        setRoomName(room.name || "Chat");
      }
    } else if (channelId) {
        if (channelId.startsWith('#')) {
            setRoomName(channelId.split(':')[0]);
        }
    }
  }, [roomId, channelId]);

  const title = roomName;

  const handleSend = async (text: string) => {
    if (roomId) {
        await AppRepository.chat.sendMessage(roomId, text);
        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    } else {
        console.warn('⚠️ No Matrix Room ID, cannot send message');
    }
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    // Scroll to bottom on new message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

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

      {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.accent} />
          </View>
      ) : (
      <FlatList
          ref={flatListRef}
          data={[...messages].reverse()} // Reverse data for inverted list
          inverted={true} // Invert list to stick to bottom
          alwaysBounceVertical={true} // Allow scrolling even if content is short (iOS)
          overScrollMode="always" // Allow scrolling even if content is short (Android)
          keyExtractor={(item) => item.id}
          onMomentumScrollBegin={() => {
              // User started scrolling
              canLoadMore.current = true;
          }}
          onEndReached={() => {
              const store = useChatStore.getState();
              // Check hasMore to prevent useless calls
              if (roomId && !store.isLoadingHistory && canLoadMore.current && store.hasMore[roomId] !== false) {
                  console.log("Loading more messages (User Scrolled)...");
                  canLoadMore.current = false; // Reset to prevent double trigger
                  AppRepository.chat.loadMoreMessages(roomId);
              }
          }}
          onEndReachedThreshold={0.2} // Reduced sensitivity (20%)
          ListFooterComponent={() => (
              useChatStore.getState().isLoadingHistory ? (
                  <View style={{ padding: 20 }}>
                      <ActivityIndicator size="small" color={colors.accent} />
                  </View>
              ) : null
          )}
          renderItem={({ item }) => {
            const currentUserId = matrixService.auth.getUserId();
            
            // Resolve Sender Name
            const serverId = matrixMapping[item.senderId];
            const senderUser = serverId ? identities[serverId] : null;
            const senderName = senderUser?.displayName || item.senderId;
            const senderAvatar = senderUser?.avatarUrl;

            return (
              <MessageBubble
                message={{
                    id: item.id,
                    text: item.text,
                    senderId: item.senderId,
                    senderName: senderName,
                    senderAvatar: senderAvatar,
                    timestamp: new Date(item.timestamp).toISOString(),
                }}
                isMe={item.senderId === currentUserId}
                onAvatarPress={handleAvatarPress}
              />
            );
          }}
          style={styles.flatList}
          contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        />
      )}
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
