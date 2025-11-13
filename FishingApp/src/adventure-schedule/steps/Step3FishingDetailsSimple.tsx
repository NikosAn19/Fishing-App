import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../../theme/colors";
import { glassStyle } from "../styles/glass";

interface Step3FishingDetailsSimpleProps {
  initialDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
  onDetailsUpdated: (details: {
    technique?: string;
    lures?: string[];
    notes?: string;
  }) => void;
}

export default function Step3FishingDetailsSimple({
  initialDetails,
  onDetailsUpdated,
}: Step3FishingDetailsSimpleProps) {
  return (
    <View
      style={[
        styles.container,
        glassStyle({ highlight: true, withShadow: true }),
      ]}
    >
      <Text style={styles.title}>Fishing Details (Optional)</Text>
      <Text style={styles.subtitle}>
        This step is optional. You can skip it and proceed to the forecast.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
});
