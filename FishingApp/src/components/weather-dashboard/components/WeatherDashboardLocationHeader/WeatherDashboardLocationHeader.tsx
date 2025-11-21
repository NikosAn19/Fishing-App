import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, Anchor } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardLocationHeaderProps } from "./types";

export default function WeatherDashboardLocationHeader({
  locationLabel,
  locationText,
  onAnchorPress,
}: WeatherDashboardLocationHeaderProps) {
  return (
    <View style={styles.headerTop}>
      <View>
        <View style={styles.locationRow}>
          <MapPin
            size={14}
            color={colors.palette.emerald[400]}
            fill={colors.palette.emerald[400]}
            style={{ opacity: 0.8 }}
          />
          <Text style={styles.locationLabel}>{locationLabel}</Text>
        </View>
        <Text style={styles.locationText}>{locationText ?? "—"}</Text>
      </View>
      <TouchableOpacity style={styles.anchorButton} onPress={onAnchorPress}>
        <Anchor size={18} color={colors.palette.slate[400]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.palette.emerald[400],
    marginLeft: 8,
  },
  locationText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    lineHeight: 20,
  },
  anchorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palette.slate[900] + "80",
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
    alignItems: "center",
    justifyContent: "center",
  },
});
