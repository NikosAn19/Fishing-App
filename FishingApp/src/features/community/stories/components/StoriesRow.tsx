import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image, Modal, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../../theme/colors";
import { useStories } from "../hooks/useStories";
import StoryCircle from "./StoryCircle";
import { useAuthStore } from "../../../auth/stores/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function StoriesRow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stories, loading } = useStories();
  const currentUser = useAuthStore(state => state.user);
  
  const [showOptions, setShowOptions] = useState(false);

  const myStory = stories.find(s => s.isMe);
  const otherStories = stories.filter(s => !s.isMe);

  const handleStoryPress = (userId: string) => {
    router.push(`/community/stories/${userId}`);
  };

  const handleCreateStory = () => {
    setShowOptions(true);
  };

  const handleImageSelection = async (mode: 'camera' | 'gallery') => {
    try {
        setShowOptions(false);
        let result: ImagePicker.ImagePickerResult;

        if (mode === 'camera') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Camera permission is required.");
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.8,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.8,
            });
        }

        if (!result.canceled && result.assets[0].uri) {
            router.push({
                pathname: '/community/stories/create',
                params: { imageUri: result.assets[0].uri }
            });
        }
    } catch (error) {
        console.error("Image selection failed", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Story or Add Story */}
        <View style={styles.myStoryContainer}>
            {myStory ? (
                <StoryCircle 
                    userStory={myStory} 
                    onPress={() => handleStoryPress(currentUser?.id || '')} 
                />
            ) : (
                <TouchableOpacity style={styles.addStoryButton} onPress={handleCreateStory}>
                    <View style={styles.avatarPlaceholder}>
                         {currentUser?.avatarUrl ? (
                             <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImage} />
                         ) : (
                             <Ionicons name="person" size={30} color={colors.textSecondary} />
                         )}
                    </View>
                    <View style={styles.plusBadge}>
                        <Ionicons name="add" size={16} color="white" />
                    </View>
                    <Text style={styles.storyText}>Your Story</Text>
                </TouchableOpacity>
            )}
        </View>

        {/* Other Stories */}
        {otherStories.map((userStory) => (
          <StoryCircle
            key={userStory.userId}
            userStory={userStory}
            onPress={() => handleStoryPress(userStory.userId)}
          />
        ))}
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowOptions(false)}
          >
              <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                  <Text style={styles.modalTitle}>Create Story</Text>
                  
                  <View style={styles.modalOptions}>
                      <TouchableOpacity style={styles.optionItem} onPress={() => handleImageSelection('camera')}>
                          <View style={[styles.optionIcon, { backgroundColor: '#E1306C' }]}>
                              <Ionicons name="camera" size={24} color="white" />
                          </View>
                          <Text style={styles.optionLabel}>Camera</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.optionItem} onPress={() => handleImageSelection('gallery')}>
                          <View style={[styles.optionIcon, { backgroundColor: '#405DE6' }]}>
                              <Ionicons name="images" size={24} color="white" />
                          </View>
                          <Text style={styles.optionLabel}>Gallery</Text>
                      </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptions(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </TouchableOpacity>
      </Modal>
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
    alignItems: 'center',
  },
  myStoryContainer: {
      marginRight: 16,
  },
  addStoryButton: {
      alignItems: 'center',
      width: 72,
  },
  avatarPlaceholder: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.tertiaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.palette.slate[700],
      marginBottom: 4,
  },
  avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 34,
  },
  plusBadge: {
      position: 'absolute',
      bottom: 22,
      right: 0,
      backgroundColor: colors.accent,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primaryBg,
  },
  storyText: {
      color: colors.textPrimary,
      fontSize: 11,
      textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: colors.palette.slate[900],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      alignItems: 'center',
  },
  modalTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  modalOptions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 30,
  },
  optionItem: {
      alignItems: 'center',
  },
  optionIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
  },
  optionLabel: {
      color: 'white',
      fontWeight: '600',
  },
  cancelButton: {
      width: '100%',
      padding: 15,
      alignItems: 'center',
      backgroundColor: colors.palette.slate[800],
      borderRadius: 12,
  },
  cancelText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  }
});
