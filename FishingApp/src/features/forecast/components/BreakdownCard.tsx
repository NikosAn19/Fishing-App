import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sun } from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { BORDER, CARD_BG } from "../tokens";
import { Recommendation } from "../types";

type Props = { recommendations: Recommendation[] };

export default function RecommendationsGrid({ recommendations }: Props) {
  return (
    <>
      <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
        Συστάσεις
      </Text>
      <View style={styles.recsGrid}>
        {recommendations.map((r) => (
          <View key={r.title} style={styles.recCard}>
            <View style={styles.recHeader}>
              <Sun size={18} color={colors.accent} />
              <Text style={styles.recTitle}>{r.title}</Text>
            </View>
            <View style={{ gap: 4, marginTop: 6 }}>
              {r.lines.map((l, i) => (
                <Text key={i} style={styles.recLine}>
                  {l}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "800" },
  recsGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  recCard: {
    flexBasis: "48%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  recHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  recTitle: { color: colors.white, fontSize: 14, fontWeight: "800" },
  recLine: { color: "#D8DEE9", fontSize: 13 },
});
