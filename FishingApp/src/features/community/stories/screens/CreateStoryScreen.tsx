import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetchJson } from '../../../../utils/apiClient';
import { storyRepository } from '../repositories/StoryRepository';
import { Ionicons } from '@expo/vector-icons';

export default function CreateStoryScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);

  // If no imageUri provided (edge case), go back immediately
  React.useEffect(() => {
      if (!imageUri) {
          router.back();
      }
  }, [imageUri]);

  if (!imageUri) return <View style={styles.container} />;

  const uploadStory = async () => {
    setUploading(true);
    try {
        // 1. Get Presigned URL
        const ext = imageUri.split('.').pop() || 'jpg';
        const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        
        const signRes = await apiFetchJson<{ fileKey: string; uploadUrl: string }>('/api/uploads/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType, ext })
        });
        
        // 2. Upload to R2 (Direct PUT)
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        await fetch(signRes.uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
                'Content-Type': contentType
            }
        });
        
        // 3. Complete Upload
        const completeRes = await apiFetchJson<{ url: string }>('/api/uploads/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileKey: signRes.fileKey, contentType })
        });

        // 4. Create Story Record
        await storyRepository.createStory(completeRes.url, 'image');
        
        // 5. Navigate Back
        Alert.alert("Success", "Your story has been posted!");
        router.back();
        
    } catch (error) {
        console.error("Upload failed", error);
        Alert.alert("Error", "Failed to upload story. Please try again.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Preview */}
      <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
      
      {/* Bottom Control Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={uploading}
          >
              <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={uploadStory} 
            disabled={uploading}
          >
              {uploading ? (
                  <ActivityIndicator color={colors.palette.slate[900]} />
              ) : (
                  <>
                    <Text style={styles.shareButtonText}>Share to Story</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.palette.slate[900]} style={{ marginLeft: 8 }} />
                  </>
              )}
          </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    // Gradient or background for visibility?
    // Let's add a subtle semi-transparent dark background
    backgroundColor: 'rgba(0,0,0,0.6)', 
    zIndex: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: 'white', // High contrast
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
