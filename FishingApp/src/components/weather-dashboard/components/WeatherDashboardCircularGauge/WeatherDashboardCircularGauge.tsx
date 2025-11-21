import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardCircularGaugeProps } from "./types";

export default function WeatherDashboardCircularGauge({
  score,
  label = "ΔΕΙΚΤΗΣ",
  size = 100,
  strokeColor = colors.palette.emerald[500],
  backgroundColor = colors.palette.emerald[500] + "33",
}: WeatherDashboardCircularGaugeProps) {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.bg,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor,
          },
        ]}
      />
      <Svg
        height={size.toString()}
        width={size.toString()}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.palette.slate[800]}
          strokeWidth="6"
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference.toString()}
          strokeDashoffset={strokeDashoffset.toString()}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.score}>{isNaN(score) ? 0 : score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    position: "absolute",
  },
  textContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.palette.slate[400],
    textTransform: "uppercase",
  },
  score: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
  },
});
