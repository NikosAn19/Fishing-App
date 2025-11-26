import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardAmbientBackgroundProps } from "./types";

export default function WeatherDashboardAmbientBackground({
  gradientColors = [
    colors.palette.emerald[900] + "40",
    colors.palette.slate[950],
  ],
  height = 500,
}: WeatherDashboardAmbientBackgroundProps) {
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        style={styles.gradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    overflow: "hidden",
    zIndex: 0,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});
