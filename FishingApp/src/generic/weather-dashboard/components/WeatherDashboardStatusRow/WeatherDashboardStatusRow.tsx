import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardStatusRowProps } from "./types";

export default function WeatherDashboardStatusRow({
  items,
}: WeatherDashboardStatusRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <View style={styles.item}>
            <item.icon
              size={12}
              color={
                item.iconColor ||
                (item.isActive
                  ? colors.palette.emerald[400]
                  : colors.palette.slate[300])
              }
            />
            <Text
              style={[
                item.isActive ? styles.textActive : styles.text,
                { marginLeft: 6 },
              ]}
            >
              {item.text ?? "—"}
            </Text>
          </View>
          {index < items.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 10,
    color: colors.palette.slate[300],
  },
  textActive: {
    fontSize: 10,
    color: colors.palette.emerald[400],
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.palette.slate[800],
  },
});
