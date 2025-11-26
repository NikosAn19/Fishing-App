import React from "react";
import { View, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { CenterCrosshairProps } from "../../types/centerCrosshairTypes";

export default function CenterCrosshair({
  visible = true,
  color = colors.palette.emerald[500],
}: CenterCrosshairProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Plus size={24} color={color} strokeWidth={2.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12, // Half of icon size
    marginLeft: -12, // Half of icon size
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
});
