import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, Clock, TrendingUp, Moon, Fish } from "lucide-react-native";
import { colors } from "../../../../src/theme/colors"; // ← adjust path
import { BORDER, CARD_BG } from "../tokens";

export type SeasonSpecies = {
  code: string; // π.χ. "aurata"
  name: string; // π.χ. "Τσιπούρα"
  likelihood: number; // 0..1  (0.85 => υψηλή)
  monthsLabel?: string; // π.χ. "Σεπ–Νοε"
  note?: string; // προαιρετικό tip
};

type Props = {
  /** π.χ. "Σεπτέμβριος" */
  monthLabel: string;
  /** π.χ. "Σεπ – Νοε" (γενικό label περιόδου) */
  seasonText?: string;
  /** λίστα με είδη και πιθανότητα */
  species: SeasonSpecies[];
  /** optional: callback όταν πατάς ένα είδος (για να ανοίξεις species guide) */
  onPressSpecies?: (code: string) => void;
};

function likelihoodLabel(v: number) {
  if (v >= 0.75) return "Υψηλή";
  if (v >= 0.5) return "Μέτρια";
  return "Χαμηλή";
}

function likelihoodTone(v: number) {
  if (v >= 0.75)
    return {
      bg: "rgba(167,243,208,0.15)",
      fg: "#A7F3D0",
      br: "rgba(167,243,208,0.45)",
    };
  if (v >= 0.5)
    return {
      bg: "rgba(238,216,141,0.15)",
      fg: "#EED88D",
      br: "rgba(238,216,141,0.45)",
    };
  return {
    bg: "rgba(155,163,175,0.12)",
    fg: "#B9C0CA",
    br: "rgba(155,163,175,0.35)",
  };
}

export default function SeasonSpeciesCard({
  monthLabel,
  seasonText,
  species,
  onPressSpecies,
}: Props) {
  const sorted = useMemo(
    () => [...species].sort((a, b) => b.likelihood - a.likelihood),
    [species]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Calendar size={18} color={colors.accent} />
            <Text style={styles.title}>Εποχικότητα & Είδη</Text>
          </View>
          <View style={styles.monthChip}>
            <Clock size={14} color={colors.accent} />
            <Text style={styles.monthText}>{monthLabel}</Text>
          </View>
        </View>

        {/* Season hint */}
        {seasonText ? (
          <View style={styles.seasonHint}>
            <TrendingUp size={14} color={colors.accent} />
            <Text style={styles.seasonText}>Σεζόν: {seasonText}</Text>
          </View>
        ) : null}

        {/* Species list */}
        <View style={{ gap: 10, marginTop: 8 }}>
          {sorted.map((sp) => {
            const tone = likelihoodTone(sp.likelihood);
            return (
              <TouchableOpacity
                key={sp.code}
                activeOpacity={0.85}
                onPress={() => onPressSpecies?.(sp.code)}
                style={styles.itemRow}
              >
                <View style={styles.itemLeft}>
                  <View
                    style={[styles.iconDot, { backgroundColor: tone.fg }]}
                  />
                  <Text style={styles.itemTitle}>{sp.name}</Text>
                </View>

                <View style={styles.itemRight}>
                  {sp.monthsLabel ? (
                    <View style={styles.monthsBadge}>
                      <Moon size={12} color={colors.accent} />
                      <Text style={styles.monthsText}>{sp.monthsLabel}</Text>
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.likelihoodPill,
                      { backgroundColor: tone.bg, borderColor: tone.br },
                    ]}
                  >
                    <Text style={[styles.likelihoodText, { color: tone.fg }]}>
                      {likelihoodLabel(sp.likelihood)}
                    </Text>
                  </View>
                </View>

                {sp.note ? (
                  <Text style={styles.noteText}>{sp.note}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}

          {/* Empty state (αν δεν έχεις δεδομένα ακόμα) */}
          {sorted.length === 0 && (
            <View style={styles.emptyBox}>
              <Fish size={18} color="#9BA3AF" />
              <Text style={styles.emptyText}>
                Δεν υπάρχουν προτάσεις εποχικότητας
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 8 },
  card: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.white, fontSize: 16, fontWeight: "800" },

  monthChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  monthText: { color: colors.white, fontSize: 12, fontWeight: "700" },

  seasonHint: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  seasonText: { color: colors.white, fontSize: 12, fontWeight: "600" },

  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconDot: { width: 8, height: 8, borderRadius: 4 },
  itemTitle: { color: colors.white, fontSize: 15, fontWeight: "800" },

  itemRight: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  monthsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  monthsText: { color: colors.white, fontSize: 11, fontWeight: "600" },

  likelihoodPill: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  likelihoodText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },

  noteText: { color: "#B9C0CA", fontSize: 12, marginTop: 6 },
  emptyBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: { color: "#9BA3AF", fontSize: 13 },
});
