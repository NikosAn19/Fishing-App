import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, Navigation } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { BORDER } from "../tokens";

type Props = {
  onAddCatch?: () => void;
  onStartTrip?: () => void;
};

export default function FooterActions({ onAddCatch, onStartTrip }: Props) {
  return (
    <View style={styles.footerRow}>
      <TouchableOpacity
        style={[styles.ctaBtn, styles.ctaGhost]}
        onPress={onAddCatch}
      >
        <Camera size={16} color={colors.white} />
        <Text style={styles.ctaGhostText}>Καταχώρησε Αλίευμα</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ctaBtn} onPress={onStartTrip}>
        <Navigation size={16} color={colors.primaryBg} />
        <Text style={styles.ctaText}>Ξεκίνα Εξόρμηση</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 10,
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: { color: colors.primaryBg, fontSize: 14, fontWeight: "800" },
  ctaGhost: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  ctaGhostText: { color: colors.white, fontSize: 14, fontWeight: "800" },
});
