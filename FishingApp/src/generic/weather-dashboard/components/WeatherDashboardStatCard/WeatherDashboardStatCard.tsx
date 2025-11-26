import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardStatCardProps } from "./types";

export default function WeatherDashboardStatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
  subText,
  valueStyle = "default",
}: WeatherDashboardStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconBg,
            { backgroundColor: iconBgColor || iconColor + "1A" },
          ]}
        >
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View>
        {typeof value === "string" ? (
          <Text
            style={
              valueStyle === "moon"
                ? styles.valueMoon
                : valueStyle === "sea"
                ? styles.valueSea
                : styles.value
            }
          >
            {value ?? "—"}
          </Text>
        ) : value ? (
          <View
            style={
              valueStyle === "moon"
                ? { minHeight: 16 }
                : valueStyle === "sea"
                ? { minHeight: 20 }
                : { minHeight: 18 }
            }
          >
            {value}
          </View>
        ) : (
          <Text
            style={
              valueStyle === "moon"
                ? styles.valueMoon
                : valueStyle === "sea"
                ? styles.valueSea
                : styles.value
            }
          >
            —
          </Text>
        )}
        {subText && typeof subText === "string" && subText.trim() !== "" ? (
          <Text style={styles.subText}>{subText}</Text>
        ) : subText && typeof subText !== "string" ? (
          subText
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.palette.slate[900] + "99",
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
    height: 112,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBg: {
    padding: 6,
    borderRadius: 8,
  },
  label: {
    fontSize: 10,
    color: colors.palette.slate[500],
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  valueMoon: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    lineHeight: 16,
  },
  valueSea: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subText: {
    fontSize: 10,
    color: colors.palette.slate[400],
    marginTop: 2,
  },
});
