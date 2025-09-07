import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertTriangle, AlertCircle } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { ForecastAlert } from "../types";

type Props = { alert?: ForecastAlert | null };

export default function AlertBanner({ alert }: Props) {
  if (!alert) return null;
  const isAmber = alert.level === "amber";
  return (
    <View
      style={[styles.alertBox, isAmber ? styles.alertAmber : styles.alertRed]}
    >
      {isAmber ? (
        <AlertTriangle size={18} color={colors.primaryBg} />
      ) : (
        <AlertCircle size={18} color={colors.primaryBg} />
      )}
      <Text style={styles.alertText}>{alert.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alertBox: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  alertAmber: {
    backgroundColor: "rgba(255,209,102,0.12)",
    borderColor: "rgba(255,209,102,0.45)",
  },
  alertRed: {
    backgroundColor: "rgba(255,159,122,0.12)",
    borderColor: "rgba(255,159,122,0.45)",
  },
  alertText: { color: colors.white, fontSize: 13, flex: 1 },
});
