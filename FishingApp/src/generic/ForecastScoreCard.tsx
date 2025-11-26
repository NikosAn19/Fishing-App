import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

interface ForecastScoreCardProps {
  score: number;
  header?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  showScoreOutOf?: boolean;
}

const getScoreGradient = (score: number) => {
  if (score >= 85)
    return [colors.accentGradientStart, colors.accentGradientEnd];
  if (score >= 70) return ["#059669", "#047857"]; // emerald-600 to emerald-700
  return ["#065f46", "#064e3b"]; // emerald-800 to emerald-900
};

const getScoreCondition = (score: number) => {
  if (score >= 85) return "Εξαιρετικές";
  if (score >= 70) return "Καλές";
  return "Μέτριες";
};

export default function ForecastScoreCard({
  score,
  header,
  children,
  style,
  showScoreOutOf = false,
}: ForecastScoreCardProps) {
  const scoreCondition = getScoreCondition(score);
  const gradientColors = getScoreGradient(score);

  return (
    <View style={[styles.mainCard, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Decorative Circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        <View style={styles.cardContent}>
          {/* Header */}
          {header && <View style={styles.headerContainer}>{header}</View>}

          {/* Score Display */}
          <View style={styles.scoreSection}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <View style={styles.scoreMetaRow}>
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionText}>{scoreCondition}</Text>
              </View>
              {showScoreOutOf && <Text style={styles.scoreOutOf}>/ 100</Text>}
            </View>
          </View>

          {/* Custom Content */}
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  gradientCard: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  circleTopRight: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.overlay10,
  },
  circleBottomLeft: {
    position: "absolute",
    bottom: -32,
    left: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.overlayDark10,
  },
  cardContent: {
    position: "relative",
    zIndex: 1,
  },
  headerContainer: {
    marginBottom: 20,
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -2,
    lineHeight: 72,
    marginBottom: 8,
  },
  scoreMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  conditionBadge: {
    backgroundColor: colors.overlay20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  conditionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  scoreOutOf: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
    opacity: 0.7,
  },
});
