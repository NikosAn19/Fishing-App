import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import WeatherDashboardCircularGauge from "../WeatherDashboardCircularGauge/WeatherDashboardCircularGauge";
import WeatherDashboardStatusRow from "../WeatherDashboardStatusRow/WeatherDashboardStatusRow";
import { getMainIcon } from "../../utils/weatherDashboardIcons/weatherDashboardIcons";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardMainCardProps } from "./types";

export default function WeatherDashboardMainCard({
  condition,
  iconKey,
  isDaytime = true,
  temp,
  high,
  low,
  score,
  statusItems,
}: WeatherDashboardMainCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          colors.palette.emerald[900] + "40",
          colors.palette.blue[600] + "20",
        ]}
        style={styles.gradient}
      />
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.top}>
            <View style={styles.weatherLeft}>
              <View style={styles.conditionBadgeRow}>
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionBadgeText}>
                    {condition ?? "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.iconContainer}>
                {getMainIcon(iconKey, 72, isDaytime)}
              </View>
              <View style={styles.tempRow}>
                <Text style={styles.tempMain}>{isNaN(temp) ? 0 : temp}°</Text>
                <Text style={styles.tempRange}>
                  Y: {isNaN(high) ? 0 : high}° X: {isNaN(low) ? 0 : low}°
                </Text>
              </View>
            </View>

            <WeatherDashboardCircularGauge score={score} />
          </View>

          <View style={styles.divider} />

          <WeatherDashboardStatusRow items={statusItems} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 20,
    position: "relative",
    marginHorizontal: 20,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  blur: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.palette.slate[800] + "99",
  },
  content: {
    padding: 20,
    backgroundColor: colors.palette.slate[900] + "66",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherLeft: {
    justifyContent: "center",
  },
  conditionBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.palette.slate[800] + "80",
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
  },
  conditionBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.palette.slate[300],
  },
  iconContainer: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
    marginLeft: 8,
  },
  tempMain: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tempRange: {
    color: colors.palette.slate[400],
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.palette.slate[800] + "80",
    marginVertical: 16,
  },
});
