import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  Flag,
  Waves,
  Thermometer,
  Droplets,
  Cloud,
  Gauge,
} from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { Driver } from "../types";
import WindDriverCard from "./WindDriverCard";

type Props = { drivers: Driver[] };

// Icon mapping function
const getIcon = (iconName: string, size: number, color: string) => {
  switch (iconName) {
    case "wind":
      return <Flag size={size} color={color} />;
    case "waves":
      return <Waves size={size} color={color} />;
    case "thermometer":
      return <Thermometer size={size} color={color} />;
    case "droplets":
      return <Droplets size={size} color={color} />;
    case "cloud":
      return <Cloud size={size} color={color} />;
    case "gauge":
      return <Gauge size={size} color={color} />;
    default:
      return <Flag size={size} color={color} />;
  }
};

export default function DriversRow({ drivers }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Καιρικές συνθήκες</Text>
      <ScrollView
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingVertical: 6,
          gap: 8,
        }}
        showsHorizontalScrollIndicator={false}
      >
        {drivers.map((d) => {
          const isWind =
            d.title.trim().toLowerCase() === "άνεμος" ||
            d.icon === ("leaf-outline" as any);
          if (isWind) return <WindDriverCard key={d.title} driver={d} />;

          return (
            <View
              key={d.title}
              style={[
                styles.driverCard,
                d.verdict === "warn" ? styles.driverWarn : undefined,
              ]}
            >
              <View style={styles.driverHeader}>
                {getIcon(
                  d.icon,
                  18,
                  d.verdict === "warn" ? colors.warning : colors.accent
                )}
                <Text style={styles.driverTitle}>{d.title}</Text>
              </View>
              <Text style={styles.driverValue}>{d.value}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  driverCard: {
    minWidth: 140,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  driverTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  driverValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  driverWarn: {
    borderColor: colors.warning,
    backgroundColor: colors.tertiaryBg,
  },
});
