import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flag } from "lucide-react-native";
import { colors } from "../../../../src/theme/colors"; // adjust path
import { BORDER, CARD_BG } from "../tokens";
import { Driver } from "../types";
import { knotsToBeaufort, parseWindKnots } from "../utils/wind";

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

type Props = { driver: Driver };

export default function WindDriverCard({ driver }: Props) {
  const parsed = parseWindKnots(driver.value);
  let primary = driver.value; // fallback

  if (parsed.minKn != null && parsed.maxKn != null) {
    const bMin = knotsToBeaufort(parsed.minKn);
    const bMax = knotsToBeaufort(parsed.maxKn);
    primary = `${parsed.direction ? parsed.direction + " " : ""}${
      bMin === bMax ? bMin : `${bMin}–${bMax}`
    } Μποφόρ`;
  } else if (parsed.singleKn != null) {
    const b = knotsToBeaufort(parsed.singleKn);
    primary = `${parsed.direction ? parsed.direction + " " : ""}${b} Μποφόρ`;
  } else if (parsed.direction) {
    primary = parsed.direction; // no numbers found, show direction only
  }

  return (
    <View
      style={[
        styles.card,
        getGlassStyle(),
        driver.verdict === "warn" ? styles.warn : undefined,
      ]}
    >
      <View style={styles.header}>
        <Flag
          size={18}
          color={driver.verdict === "warn" ? "#FFD166" : colors.accent}
        />
        <Text style={styles.title}>{driver.title}</Text>
      </View>
      <Text style={styles.value}>{primary}</Text>
      {driver.note ? <Text style={styles.note}>{driver.note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    padding: 12,
    borderRadius: 16,
  },
  warn: {
    borderColor: "rgba(255,209,102,0.4)",
    backgroundColor: "rgba(255,209,102,0.2)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.white, fontSize: 13, fontWeight: "700" },
  value: { color: colors.white, fontSize: 16, fontWeight: "800", marginTop: 6 },
  note: { color: "#B9C0CA", fontSize: 12, marginTop: 2 },
});
