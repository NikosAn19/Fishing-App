import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAndRegister } from "../../../services/uploads";
import { profileApi } from "../api/client";
import { useAuth } from "../../auth/hooks/useAuth";

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { refreshUser } = useAuth();

  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access media library is required");
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access camera is required");
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const uploadAvatar = useCallback(
    async (imageUri: string): Promise<void> => {
      setUploading(true);
      setError(null);

      try {
        // Step 1: Upload image to R2
        const asset = await uploadImageAndRegister(imageUri);
        console.log("✅ Avatar uploaded to R2:", asset.url);

        // Step 2: Update user profile with avatarUrl
        await profileApi.updateProfile({ avatarUrl: asset.url });

        // Step 3: Refresh auth store to get updated user (without triggering splash screen)
        await refreshUser();

        console.log("✅ Avatar updated successfully");
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setUploading(false);
      }
    },
    [refreshUser]
  );

  const handlePickAndUpload = useCallback(async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        await uploadAvatar(uri);
      }
    } catch (err) {
      // Error already set in pickImage or uploadAvatar
    }
  }, [pickImage, uploadAvatar]);

  const handleTakePhotoAndUpload = useCallback(async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        await uploadAvatar(uri);
      }
    } catch (err) {
      // Error already set in takePhoto or uploadAvatar
    }
  }, [takePhoto, uploadAvatar]);

  return {
    uploading,
    error,
    pickImage,
    takePhoto,
    uploadAvatar,
    handlePickAndUpload,
    handleTakePhotoAndUpload,
  };
}
