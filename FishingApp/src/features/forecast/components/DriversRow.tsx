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
import { colors } from "../../../../src/theme/colors"; // adjust path
import { BORDER, CARD_BG } from "../tokens";
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
    <>
      <Text
        style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 8 }]}
      >
        Καιρικές συνθήκες
      </Text>
      <ScrollView
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 10,
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
                  d.verdict === "warn" ? "#FFD166" : colors.accent
                )}
                <Text style={styles.driverTitle}>{d.title}</Text>
              </View>
              <Text style={styles.driverValue}>{d.value}</Text>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "800" },
  driverCard: {
    width: 180,
    padding: 12,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  driverHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  driverTitle: { color: colors.white, fontSize: 13, fontWeight: "700" },
  driverValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  driverWarn: {
    borderColor: "rgba(255,209,102,0.35)",
    backgroundColor: "rgba(255,209,102,0.10)",
  },
});
