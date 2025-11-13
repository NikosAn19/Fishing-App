import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sun } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { Recommendation } from "../types";

type Props = { recommendations: Recommendation[] };

export default function RecommendationsGrid({ recommendations }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Συστάσεις</Text>
      <View style={styles.recsGrid}>
        {recommendations.map((r) => (
          <View key={r.title} style={styles.recCard}>
            <View style={styles.recHeader}>
              <Sun size={18} color={colors.accent} strokeWidth={2.5} />
              <Text style={styles.recTitle}>{r.title}</Text>
            </View>
            <View style={styles.recContent}>
              {r.lines.map((l, i) => (
                <Text key={i} style={styles.recLine}>
                  {l}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  recsGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  recCard: {
    flex: 1,
    minWidth: "48%",
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  recContent: {
    gap: 4,
  },
  recLine: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
