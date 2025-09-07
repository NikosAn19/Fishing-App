import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path

type Props = {
  location: string;
  dateLabel: string;
  onChangeSpot?: () => void;
};

export default function ForecastHeader({
  location,
  dateLabel,
  onChangeSpot,
}: Props) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>
      <TouchableOpacity style={styles.pillBtn} onPress={onChangeSpot}>
        <MapPin size={16} color={colors.accent} />
        <Text style={styles.pillBtnText}>Αλλαγή spot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  location: { color: colors.white, fontSize: 18, fontWeight: "700" },
  dateLabel: { color: "#9BA3AF", fontSize: 13, marginTop: 2 },
  pillBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  pillBtnText: { color: colors.primaryBg, fontWeight: "700", fontSize: 13 },
});
