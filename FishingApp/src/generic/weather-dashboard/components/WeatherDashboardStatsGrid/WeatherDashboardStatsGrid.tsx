import React from "react";
import { View, StyleSheet } from "react-native";
import WeatherDashboardStatCard from "../WeatherDashboardStatCard/WeatherDashboardStatCard";
import { WeatherDashboardStatsGridProps } from "./types";

export default function WeatherDashboardStatsGrid({
  stats,
  columns = 2,
}: WeatherDashboardStatsGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((stat, index) => (
        <WeatherDashboardStatCard key={index} {...stat} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
});
