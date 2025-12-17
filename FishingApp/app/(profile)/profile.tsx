import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme/colors";
import { ProfileView } from "../../src/features/profile/components/ProfileView";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { useAvatarUpload } from "../../src/features/profile/hooks/useAvatarUpload";
import { useProfileUpdate } from "../../src/features/profile/hooks/useProfileUpdate";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const { uploading, handlePickAndUpload, handleTakePhotoAndUpload } =
    useAvatarUpload();
  const { updateDisplayName, updating } = useProfileUpdate();

  // Update displayName when user data changes
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  const handleSave = async () => {
    try {
      if (displayName !== user?.displayName) {
        await updateDisplayName(displayName);
      }
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
  };

  const handleAvatarPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhotoAndUpload();
          } else if (buttonIndex === 2) {
            handlePickAndUpload();
          }
        }
      );
    } else {
      // Android: Use Alert
      Alert.alert("Change Avatar", "Select an option", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: handleTakePhotoAndUpload,
        },
        {
          text: "Choose from Library",
          onPress: handlePickAndUpload,
        },
      ]);
    }
  };

  if (!user) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.accent} style={{marginTop: 50}} />
        </View>
    );
  }

  // Ensure user properties are string | undefined, never null
  const safeUser = {
      ...user,
      displayName: user.displayName || undefined,
      avatarUrl: user.avatarUrl || undefined,
  };

  return (
    <ProfileView
      user={safeUser}
      isEditing={isEditing}
      onEditStart={() => setIsEditing(true)}
      onEditCancel={handleCancel}
      onEditSave={handleSave}
      isUpdating={updating}
      displayName={displayName}
      onDisplayNameChange={setDisplayName}
      isUploadingAvatar={uploading}
      onAvatarPress={handleAvatarPress}
      showEditButton={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
});
