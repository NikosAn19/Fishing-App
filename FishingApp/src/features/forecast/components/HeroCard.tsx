import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sun, Contrast, Sunrise, Sunset } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { BestWindow, StatusInfo } from "../types";
import ForecastScoreCard from "../../../components/ForecastScoreCard";

type Props = {
  score: number;
  delta: number;
  status: StatusInfo;
  bestWindows: BestWindow[];
  moonLabel?: string;
  tideLabel?: string;
  sunsetLabel?: string;
};

export default function HeroCard({
  score,
  delta,
  status,
  bestWindows,
  moonLabel = "Φάση σελήνης: –",
  tideLabel = "Ανατολή ηλίου: –",
  sunsetLabel = "—",
}: Props) {
  return (
    <View style={styles.container}>
      {/* Hero Score Card */}
      <ForecastScoreCard
        score={score}
        style={styles.heroCard}
        header={<Text style={styles.headerLabel}>Συνθήκες Ψαρέματος</Text>}
      >
        {/* Best Windows */}
        <View style={styles.windowsContainer}>
          <Text style={styles.windowsTitle}>Καλύτερες Ώρες</Text>
          <View style={styles.windowsGrid}>
            {bestWindows.slice(0, 2).map((w, idx) => (
              <View key={idx} style={styles.windowChip}>
                <Sun size={14} color={colors.white} strokeWidth={2.5} />
                <Text style={styles.windowText}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ForecastScoreCard>

      {/* Conditions Grid */}
      <View style={styles.conditionsGrid}>
        {[
          { icon: Contrast, label: moonLabel },
          { icon: Sunrise, label: tideLabel },
          { icon: Sunset, label: `Δύση: ${sunsetLabel}` },
        ].map((item, idx) => (
          <View key={idx} style={styles.conditionCard}>
            <item.icon size={18} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.conditionLabel} numberOfLines={2}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 10,
  },

  heroCard: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 12,
  },

  headerLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    opacity: 0.85,
  },

  windowsContainer: {
    gap: 12,
  },

  windowsTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  windowsGrid: {
    flexDirection: "row",
    gap: 8,
  },

  windowChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.overlay10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  windowText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },

  conditionsGrid: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
  },

  conditionCard: {
    flex: 1,
    backgroundColor: colors.secondaryBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },

  conditionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
});
