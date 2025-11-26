import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardDaySelectorProps } from "./types";

export default function WeatherDashboardDaySelector({
  days,
  selectedIndex,
  onDaySelect,
}: WeatherDashboardDaySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {days.map((day, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <TouchableOpacity
            key={day.id}
            onPress={() => onDaySelect(idx)}
            style={[
              styles.button,
              isSelected ? styles.buttonSelected : styles.buttonUnselected,
            ]}
          >
            <Text
              style={[
                styles.dayName,
                isSelected ? styles.dayNameSelected : styles.dayNameUnselected,
              ]}
            >
              {day.dayName ?? "—"}
            </Text>
            <Text
              style={[
                styles.dayDate,
                isSelected ? styles.dayDateSelected : styles.dayDateUnselected,
              ]}
            >
              {day.date?.split("/")[0] ?? "—"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 20,
    paddingTop: 4,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
    height: 65,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  buttonSelected: {
    backgroundColor: colors.palette.emerald[500],
    borderColor: colors.palette.emerald[400],
    shadowColor: colors.palette.emerald[500],
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonUnselected: {
    backgroundColor: colors.palette.slate[900] + "80",
    borderColor: colors.palette.slate[800],
  },
  dayName: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  dayNameSelected: {
    color: colors.palette.slate[950],
  },
  dayNameUnselected: {
    color: colors.palette.slate[400],
  },
  dayDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dayDateSelected: {
    color: colors.palette.slate[900],
  },
  dayDateUnselected: {
    color: "#ffffff",
  },
});
