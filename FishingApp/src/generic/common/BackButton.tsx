import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "../../theme/colors";

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const BackButton = ({ onPress, style }: BackButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <ArrowLeft size={20} color="#FFFFFF" />
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden", // Required for BlurView to respect borderRadius
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900/90
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
