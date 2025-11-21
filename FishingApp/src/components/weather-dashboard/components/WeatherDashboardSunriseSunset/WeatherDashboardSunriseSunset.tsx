import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sunrise, Sunset } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardSunriseSunsetProps } from "./types";

export default function WeatherDashboardSunriseSunset({
  sunrise,
  sunset,
  progress,
}: WeatherDashboardSunriseSunsetProps) {
  // Default progress to 65% if not provided
  const barProgress = progress ?? 0.65;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.item}>
            <Sunrise size={20} color={colors.palette.amber[400]} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>ΑΝΑΤΟΛΗ</Text>
              <Text style={styles.value}>{sunrise ?? "—"}</Text>
            </View>
          </View>
          <View style={styles.item}>
            <View style={styles.itemRight}>
              <Text style={styles.label}>ΔΥΣΗ</Text>
              <Text style={styles.value}>{sunset ?? "—"}</Text>
            </View>
            <Sunset
              size={20}
              color={colors.palette.indigo[400]}
              style={styles.sunsetIcon}
            />
          </View>
        </View>
        {/* Visual Bar */}
        <View style={styles.bar}>
          <LinearGradient
            colors={[colors.palette.amber[400], colors.palette.indigo[400]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barGradient, { width: `${barProgress * 100}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },
  card: {
    width: "100%",
    backgroundColor: colors.palette.slate[900] + "99",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 8,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  sunsetIcon: {
    marginLeft: 8,
  },
  label: {
    fontSize: 10,
    color: colors.palette.slate[500],
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  bar: {
    height: 8,
    width: "100%",
    backgroundColor: colors.palette.slate[800],
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
  },
  barGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
});
