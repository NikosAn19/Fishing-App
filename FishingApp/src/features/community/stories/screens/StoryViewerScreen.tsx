import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserStory, Story } from '../types/storyTypes';
import { storyRepository } from '../repositories/StoryRepository';
import { userRepository } from '../../../auth/repositories/UserRepository';
import { AppRepository } from '../../../../repositories';
import { UserAdapter } from '../../../auth/adapters/UserAdapter';
import { UserAction } from '../../chat/domain/enums/UserAction';
import { colors } from '../../../../theme/colors';
import StoryReplyInput from '../components/StoryReplyInput';
import { useAuthStore } from '../../../auth/stores/authStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function StoryViewerScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [feed, setFeed] = useState<UserStory[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const userStory = currentUserIndex !== -1 ? feed[currentUserIndex] : null;
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const START_TIME = useRef(Date.now());
  const PAUSE_TIME = useRef(0);
  const DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    loadFeed();
    return () => stopTimer();
  }, [userId]);

  const currentUser = useAuthStore(state => state.user);

  const loadFeed = async () => {
    try {
      const storyFeed = await storyRepository.getFeed();
      setFeed(storyFeed);
      
      const userIdx = storyFeed.findIndex(u => u.userId === userId);
      if (userIdx !== -1) {
        setCurrentUserIndex(userIdx);
        const user = storyFeed[userIdx];
        
        // Find first unseen story for this user
        const firstUnseen = user.stories.findIndex(s => 
          !s.views?.some(v => v.user === currentUser?.id)
        );
        setCurrentIndex(firstUnseen !== -1 ? firstUnseen : 0);
      } else {
        Alert.alert("Error", "Story not found");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load feed", error);
    }
  };

  // Helper to check if story is seen (simulated locally if needed, but rely on backend mostly)
  // Since specific view status is inside `views` array which is complex to parse on frontend without backend help,
  // we rely on backend 'allViewed' or manual logic. For now, assume 'viewed' logic is handled by client tracking mostly.
  // Actually, I should mark as viewed when showing.
  const isStorySeen = (story: Story) => {
      // Logic for checking client side if implemented, or assume false if not present
      // The backend returns aggregation `allViewed`. It doesn't modify the `views` array to simple booleans per story for me yet.
      // Wait, let's just proceed linearly.
      return false; 
  };


  useEffect(() => {
    if (!userStory) return;
    
    // Start timer for current story
    startTimer();
    
    // Mark as viewed
    const currentStory = userStory.stories[currentIndex];
    storyRepository.viewStory(currentStory._id).catch(console.error);

  }, [currentIndex, userStory]);

  const startTimer = () => {
    stopTimer();
    START_TIME.current = Date.now() - (PAUSE_TIME.current || 0);
    PAUSE_TIME.current = 0;
    setIsPaused(false);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - START_TIME.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);

      if (elapsed >= DURATION) {
        handleNext();
      }
    }, 50);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
    stopTimer();
    PAUSE_TIME.current = Date.now() - START_TIME.current;
  };

  const resumeTimer = () => {
    if (isPaused) {
       startTimer();
    }
  };

  const handleNext = () => {
    if (!userStory) return;
    
    if (currentIndex < userStory.stories.length - 1) {
      // Next story of same user
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      PAUSE_TIME.current = 0;
    } else {
      // End of this user's stories, go to next user
      if (currentUserIndex < feed.length - 1) {
        const nextUserIdx = currentUserIndex + 1;
        setCurrentUserIndex(nextUserIdx);
        setCurrentIndex(0);
        setProgress(0);
        PAUSE_TIME.current = 0;
      } else {
        // End of entire feed
        router.back();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      // Previous story of same user
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      PAUSE_TIME.current = 0;
    } else {
      // Previous user's stories
      if (currentUserIndex > 0) {
          const prevUserIdx = currentUserIndex - 1;
          const prevUser = feed[prevUserIdx];
          setCurrentUserIndex(prevUserIdx);
          setCurrentIndex(prevUser.stories.length - 1);
          setProgress(0);
          PAUSE_TIME.current = 0;
      } else {
          // Restart first story
          setProgress(0);
          PAUSE_TIME.current = 0;
          startTimer();
      }
    }
  };

  const handleReplyText = (text: string) => {
      handleReply(text);
  };

  const handleReply = async (textOverride?: string) => {
      const textToSend = textOverride || replyText;
      if (!textToSend.trim() || !userStory) return;

      pauseTimer();
      try {
          const fullUser = await userRepository.getUser(userStory.userId);
          const roomId = await userRepository.performUserAction(fullUser, UserAction.CHAT);
          const currentStory = userStory.stories[currentIndex];
          const fullMessageText = `Replying to your story: ${textToSend}`;
          
          await AppRepository.chat.sendMessageWithAttachments(roomId, fullMessageText, [{
              id: `story-reply-${Date.now()}`,
              type: 'image',
              url: currentStory.mediaUrl,
              mimeType: 'image/jpeg',
              size: 0,
              width: 0,
              height: 0
          }]);

          Alert.alert("Sent", "Reply sent!");
          setReplyText('');
          setKeyboardVisible(false);
          resumeTimer();

      } catch (error) {
          console.error("Reply failed", error);
          Alert.alert("Error", "Failed to send reply");
          resumeTimer();
      }
  };

  if (!userStory) return <View style={styles.container} />;

  const currentStory = userStory.stories[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Media Layer */}
      <Image 
        source={{ uri: currentStory.mediaUrl }} 
        style={styles.media} 
        resizeMode="cover"
      />

      {/* Touch Layers for Navigation - Placed behind the UI but above the media */}
      <View style={styles.touchLayer} pointerEvents="box-none">
          <TouchableOpacity 
             style={styles.touchLeft} 
             onPress={handlePrev} 
             onLongPress={pauseTimer}
             onPressOut={resumeTimer}
          />
          <TouchableOpacity 
             style={styles.touchRight} 
             onPress={handleNext} 
             onLongPress={pauseTimer}
             onPressOut={resumeTimer}
          />
      </View>

      {/* UI Overlay Layer - Wraps everything to handle keyboard lifting */}
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex1}
        pointerEvents="box-none"
        keyboardVerticalOffset={0}
      >
          {/* Top UI: Progress Bars and Header */}
          <View style={[styles.topOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
              <View style={styles.progressContainer}>
                 {userStory.stories.map((s, index) => (
                     <View key={s._id} style={styles.progressBarBackground}>
                         <View style={[
                             styles.progressBarFill, 
                             { 
                                 width: index < currentIndex ? '100%' : 
                                        index === currentIndex ? `${progress * 100}%` : '0%' 
                             }
                         ]} />
                     </View>
                 ))}
              </View>

              <View style={styles.header}>
                  <Image source={{ uri: userStory.userImage }} style={styles.avatar} />
                  <Text style={styles.username}>{userStory.username}</Text>
                  <Text style={styles.time}>{new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                      <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
              </View>
          </View>

          {/* Middle Spacer - Allows touches to pass through to the touchLayer below */}
          <View style={{ flex: 1 }} pointerEvents="none" />

          {/* Bottom UI: Reply Input */}
          <StoryReplyInput
            onSend={handleReplyText}
            onFocus={() => { setKeyboardVisible(true); pauseTimer(); }}
            onBlur={() => { setKeyboardVisible(false); resumeTimer(); }}
          />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  touchLayer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
  },
  touchLeft: {
      flex: 1,
  },
  touchRight: {
      flex: 2, // Larger area for next
  },
  flex1: {
      flex: 1,
  },
  safeArea: {
      flex: 1,
  },
  topOverlay: {
      paddingHorizontal: 10,
  },
  progressContainer: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 10,
  },
  progressBarBackground: {
      flex: 1,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 2,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: 'white',
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
  },
  username: {
      color: 'white',
      fontWeight: 'bold',
      marginRight: 10,
  },
  time: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 12,
  },
  closeButton: {
      padding: 5,
  },
  sendButton: {
      padding: 10,
  },
  likeButton: {
      padding: 5,
  }
});
