import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle, AlertCircle } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { ForecastAlert } from "../types";

// Enhanced Glass Morphism Styling - Clearer Effect
const getGlassStyle = (highlight = false) => ({
  backgroundColor: highlight
    ? "rgba(18, 219, 192, 0.2)"
    : "rgba(255, 255, 255, 0.12)",
  borderWidth: 1.5,
  borderColor: highlight
    ? "rgba(18, 219, 192, 0.4)"
    : "rgba(255, 255, 255, 0.25)",
  borderRadius: 20,
  // No shadows to eliminate dark center effect
});

type Props = { alert?: ForecastAlert | null };

export default function AlertBanner({ alert }: Props) {
  if (!alert) return null;
  const isAmber = alert.level === "amber";
  return (
    <View
      style={[
        styles.alertBox,
        getGlassStyle(),
        isAmber ? styles.alertAmber : styles.alertRed,
      ]}
    >
      {isAmber ? (
        <AlertTriangle size={18} color={colors.white} />
      ) : (
        <AlertCircle size={18} color={colors.white} />
      )}
      <Text style={styles.alertText}>{alert.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alertBox: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  alertAmber: {
    backgroundColor: "rgba(255,209,102,0.2)",
    borderColor: "rgba(255,209,102,0.4)",
  },
  alertRed: {
    backgroundColor: "rgba(255,159,122,0.2)",
    borderColor: "rgba(255,159,122,0.4)",
  },
  alertText: { color: colors.white, fontSize: 13, flex: 1 },
});
