import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, Navigation } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { BORDER } from "../tokens";

// Enhanced Glass Morphism Styling - Clearer Effect
const getGlassStyle = (highlight = false) => ({
  backgroundColor: highlight
    ? "rgba(18, 219, 192, 0.2)"
    : "rgba(255, 255, 255, 0.12)",
  borderWidth: 1.5,
  borderColor: highlight
    ? "rgba(18, 219, 192, 0.4)"
    : "rgba(255, 255, 255, 0.25)",
  borderRadius: 16,
  // No shadows to eliminate dark center effect
});

type Props = {
  onAddCatch?: () => void;
  onStartTrip?: () => void;
};

export default function FooterActions({ onAddCatch, onStartTrip }: Props) {
  return (
    <View style={[styles.footerRow, getGlassStyle()]}>
      <TouchableOpacity
        style={[styles.ctaBtn, getGlassStyle()]}
        onPress={onAddCatch}
      >
        <Camera size={16} color={colors.white} />
        <Text style={styles.ctaGhostText}>Καταχώρησε Αλίευμα</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.ctaBtn, getGlassStyle(true)]}
        onPress={onStartTrip}
      >
        <Navigation size={16} color={colors.white} />
        <Text style={styles.ctaText}>Ξεκίνα Εξόρμηση</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
  },
  ctaBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
  },
  ctaText: { color: colors.white, fontSize: 14, fontWeight: "800" },
  ctaGhostText: { color: colors.white, fontSize: 14, fontWeight: "800" },
});
