import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors } from "../../../../theme/colors";

interface StoryReplyInputProps {
  onSend: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function StoryReplyInput({
  onSend,
  onFocus,
  onBlur,
}: StoryReplyInputProps) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (text.trim().length === 0) return;
    onSend(text.trim());
    setText("");
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BlurView intensity={30} tint="dark" style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Πληκτρολογήστε ένα μήνυμα..."
            placeholderTextColor={colors.palette.slate[500]}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline
            maxLength={500}
            selectionColor={colors.palette.emerald[500]}
          />
          
          {text.trim().length > 0 || isFocused ? (
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={text.trim() ? "white" : colors.palette.slate[500]}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="heart-outline" size={26} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  inputWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    backgroundColor: "rgba(15, 23, 42, 0.8)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    maxHeight: 100,
    paddingRight: 8,
  },
  iconButton: {
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.palette.slate[800],
  },
});
