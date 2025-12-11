import React, { useState, useEffect, useRef, useMemo } from "react";
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
import ImageViewerModal from "../components/ImageViewerModal";
import { BackButton } from "../../../../generic/common/BackButton";


import { useIdentityStore } from "../../../auth/stores/IdentityStore";
import { AppRepository } from "../../../../repositories";
import { useChatStore } from "../infrastructure/state/ChatStore";

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
  
  // DEBUG: Log messages array
  console.log('💬 Messages in state:', {
    roomId,
    messageCount: messages.length,
    messages: messages.slice(0, 3), // First 3 messages
  });
  
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [roomName, setRoomName] = useState<string>("Chat");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  // 1. Initialize Chat Room
  useEffect(() => {
    const initChat = async () => {
      const isReady = await AppRepository.chat.initialize();
      
      if (isReady) {
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
          console.log('🔄 Loading messages for room:', roomId);
          await AppRepository.chat.loadMessages(roomId);
          await AppRepository.chat.markAsRead(roomId); // Clear unread count on entry
          console.log('✅ Messages loaded');
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
              
              // Parallel fetching for better performance
              await Promise.all(
                  Array.from(missingIds).map(mid =>
                      AppRepository.user.getUserByMatrixId(mid).catch(err => {
                          console.error(`Failed to fetch identity for ${mid}:`, err);
                          return null;  // Don't fail entire batch if one fails
                      })
                  )
              );
          }
      };
      
      if (messages.length > 0) {
          fetchMissing();  // Don't block rendering
      }
  }, [messages.length, matrixMapping]); // Run when messages change or mapping changes

  // 3. Update Room Name
  useEffect(() => {
    if (roomId) {
      const fetchRoomName = async () => {
        const roomDetails = await AppRepository.chat.getRoomDetails(roomId);
        if (roomDetails) {
          setRoomName(roomDetails.name);
        }
      };
      fetchRoomName();
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
        // Scroll to bottom (which is offset 0 in inverted list)
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
    } else {
        console.warn('⚠️ No Matrix Room ID, cannot send message');
    }
  };

  const handleSendImage = async (imageUri: string, caption?: string) => {
    if (!roomId) return;
    try {
      await AppRepository.chat.sendImage(roomId, imageUri, caption);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send image', error);
    }
  };

  const handleBack = () => {
    router.back();
  };



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

  // Memoize reversed messages for FlatList
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Image Viewer State
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Collect all images from messages for the gallery
  // We want chronological order for the gallery (Oldest -> Newest)
  const allImageUrls = useMemo(() => {
    const urls: string[] = [];
    // Iterate chronological messages
    messages.forEach(msg => {
      msg.attachments?.forEach((att: any) => { // Use explicit any or MessageAttachment if imported
        if (att.type === 'image') {
          urls.push(att.url);
        }
      });
    });
    return urls;
  }, [messages]);

  const handleImagePress = (imageUrl: string) => {
    const index = allImageUrls.indexOf(imageUrl);
    if (index !== -1) {
      setViewerIndex(index);
      setIsViewerVisible(true);
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

      {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.accent} />
          </View>
      ) : (
      <FlatList
          ref={flatListRef}
          data={reversedMessages}
          inverted={true} // Invert list to stick to bottom
          removeClippedSubviews={false} // Fix for blank spaces in inverted lists
          alwaysBounceVertical={true} // Allow scrolling even if content is short (iOS)
          overScrollMode="always" // Allow scrolling even if content is short (Android)
          keyExtractor={(item) => item.id}
          onEndReached={() => {
              const store = useChatStore.getState();
              console.log('🔝 onEndReached triggered!', {
                roomId,
                isLoadingHistory: store.isLoadingHistory,
                hasMore: roomId ? store.hasMore[roomId] : undefined,
              });
              
              // Simplified check - only 3 conditions
              if (roomId && !store.isLoadingHistory && store.hasMore[roomId] !== false) {
                  console.log("📚 Loading more messages...");
                  AppRepository.chat.loadMoreMessages(roomId);
              } else {
                  console.log("⏸️ Pagination blocked:", {
                    noRoomId: !roomId,
                    isLoading: store.isLoadingHistory,
                    noMore: roomId ? store.hasMore[roomId] === false : 'no roomId',
                  });
              }
          }}
          onEndReachedThreshold={0.5} // Trigger when 50% from end (more sensitive)
          ListFooterComponent={() => (
              useChatStore.getState().isLoadingHistory ? (
                  <View style={{ padding: 20 }}>
                      <ActivityIndicator size="small" color={colors.accent} />
                  </View>
              ) : null
          )}
          renderItem={({ item }) => {
            const currentUserId = AppRepository.chat.getCurrentUserId();
            
            // Resolve Sender Name
            const serverId = matrixMapping[item.senderId];
            const senderUser = serverId ? identities[serverId] : null;
            const senderName = senderUser?.displayName || item.senderId;
            const senderAvatar = senderUser?.avatarUrl;

            // DEBUG: Log message to see what we're getting
            console.log('📨 Rendering message:', {
              id: item.id,
              text: item.text,
              hasText: !!item.text,
              senderId: item.senderId,
              attachments: item.attachments,
            });

            return (
              <MessageBubble
                message={{
                    id: item.id,
                    text: item.text,
                    senderId: item.senderId,
                    senderName: senderName,
                    senderAvatar: senderAvatar,
                    timestamp: item.timestamp,
                    status: item.status,
                    attachments: item.attachments,
                }}
                isMe={item.senderId === currentUserId}
                onAvatarPress={handleAvatarPress}
                onImagePress={handleImagePress}
              />
            );
          }}
          style={styles.flatList}
          contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        />
      )}
        <ChatInput 
          onSend={handleSend} 
          onSendImage={handleSendImage}
        />
      </KeyboardAvoidingView>

      <UserActionModal
        visible={!!selectedUser}
        onClose={handleCloseModal}
        user={selectedUser}
        onShowProfile={handleShowProfile}
      />

      <ImageViewerModal
        visible={isViewerVisible}
        imageUrls={allImageUrls}
        initialIndex={viewerIndex}
        onClose={() => setIsViewerVisible(false)}
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
