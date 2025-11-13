import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { MapPin, ArrowLeft } from "lucide-react-native";
import { glassStyle } from "../styles/glass";

interface Step1HeaderProps {
  onBack: () => void;
}

export default function Step1Header({ onBack }: Step1HeaderProps) {
  return (
    <View
      style={[
        styles.headerContainer,
        glassStyle({ highlight: true, borderRadius: 20 }),
      ]}
    >
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.headerIconContainer}>
        <MapPin size={24} color={colors.white} strokeWidth={2.5} />
      </View>

      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Choose Your Fishing Spot</Text>
        <Text style={styles.headerSubtitle}>
          Tap anywhere on the map to select your location
        </Text>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    margin: 8,
    marginBottom: 4,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    lineHeight: 16,
  },
  placeholder: {
    width: 44,
  },
});
