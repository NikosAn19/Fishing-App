import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { useReverseGeocode } from "../../location/hooks/useReverseGeocode";

type Props = {
  lat?: number;
  lon?: number;
  dateLabel: string;
};

export default function ForecastHeader({ lat, lon, dateLabel }: Props) {
  const location = useReverseGeocode(lat, lon);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.locationRow}>
          <MapPin size={18} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.location}>{location}</Text>
        </View>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  headerCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 26,
  },
});
