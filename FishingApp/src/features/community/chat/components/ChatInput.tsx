import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../../theme/colors";
import * as ImagePicker from 'expo-image-picker';

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendImage?: (imageUri: string, caption?: string) => void;
  onImagePress?: () => void;
}

export default function ChatInput({ onSend, onSendImage, onImagePress }: ChatInputProps) {
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (text.trim().length === 0) return;
    onSend(text.trim());
    setText("");
  };

  const handleImagePick = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions!');
      return;
    }
    
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0] && onSendImage) {
      const imageUri = result.assets[0].uri;
      // Send image with current text as caption
      onSendImage(imageUri, text || undefined);
      setText(''); // Clear text after sending
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* Plus Button */}
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="add-circle" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Image Button */}
      <TouchableOpacity style={styles.iconButton} onPress={onImagePress || handleImagePick}>
        <Ionicons name="image" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        {/* Gift/Sticker Icon inside input */}
        <TouchableOpacity style={styles.giftButton}>
          <MaterialCommunityIcons name="gift" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Ionicons
          name="send"
          size={18}
          color={text.trim() ? colors.white : colors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.secondaryBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconButton: {
    padding: 6,
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tertiaryBg,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    maxHeight: 100,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    maxHeight: 100,
    paddingRight: 8,
  },
  giftButton: {
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.tertiaryBg,
  },
});
