import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, Clock, TrendingUp, Moon, Fish } from "lucide-react-native";
import { colors } from "../../../theme/colors";

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
      bg: colors.tertiaryBg,
      fg: colors.accent,
      br: colors.accent,
    };
  if (v >= 0.5)
    return {
      bg: colors.tertiaryBg,
      fg: colors.warning,
      br: colors.warning,
    };
  return {
    bg: colors.tertiaryBg,
    fg: colors.textMuted,
    br: colors.border,
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
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Calendar size={18} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.title}>Εποχικότητα & Είδη</Text>
          </View>
          <View style={styles.monthChip}>
            <Clock size={14} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.monthText}>{monthLabel}</Text>
          </View>
        </View>

        {/* Season hint */}
        {seasonText ? (
          <View style={styles.seasonHint}>
            <TrendingUp size={14} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.seasonText}>Σεζόν: {seasonText}</Text>
          </View>
        ) : null}

        {/* Species list */}
        <View style={styles.speciesList}>
          {sorted.map((sp) => {
            const tone = likelihoodTone(sp.likelihood);
            return (
              <TouchableOpacity
                key={sp.code}
                activeOpacity={0.7}
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
                      <Moon size={12} color={colors.accent} strokeWidth={2.5} />
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
              <Fish size={18} color={colors.textMuted} strokeWidth={2.5} />
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
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  monthChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.tertiaryBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },

  seasonHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.tertiaryBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  speciesList: {
    gap: 10,
    marginTop: 4,
  },

  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

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
    borderRadius: 12,
    backgroundColor: colors.tertiaryBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthsText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },

  likelihoodPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  likelihoodText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  noteText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  emptyBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
