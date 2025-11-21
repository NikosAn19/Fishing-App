import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getHourlyIcon } from "../../utils/weatherDashboardIcons/weatherDashboardIcons";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardHourlyForecastProps } from "./types";

export default function WeatherDashboardHourlyForecast({
  title = "Ωριαία Πρόγνωση",
  hourlyData,
  getWeatherIcon = getHourlyIcon,
}: WeatherDashboardHourlyForecastProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.map((h, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.time}>{h.time ?? "—"}</Text>
            <View style={styles.icon}>
              {getWeatherIcon(h.weather, 20, h.isDaytime ?? true)}
            </View>
            <Text style={styles.temp}>{isNaN(h.temp) ? 0 : h.temp}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.palette.slate[200],
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingRight: 20,
  },
  item: {
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 40,
    marginRight: 16,
  },
  time: {
    fontSize: 9,
    color: colors.palette.slate[500],
    fontWeight: "500",
  },
  icon: {
    paddingVertical: 4,
  },
  temp: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
