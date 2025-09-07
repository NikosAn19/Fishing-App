import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Sparkles,
  ThumbsUp,
  AlertCircle,
  Contrast,
  ArrowUpDown,
  Clock,
  Sun,
  Sunset,
  Sunrise,
} from "lucide-react-native";
import { colors } from "../../../theme/colors"; // ← adjust path
import { BORDER, CARD_BG } from "../tokens";
import DonutGauge from "./DonutGauge";
import { BestWindow, StatusInfo } from "../types";

type Props = {
  score: number;
  delta: number;
  status: StatusInfo;
  bestWindows: BestWindow[];
  moonLabel?: string;
  tideLabel?: string;
  /** Φορμαρισμένη ώρα δύσης (π.χ. "19:52") */
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
    <View style={styles.heroCard}>
      <View style={styles.heroLeft}>
        <DonutGauge score={score} />
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusChip,
              status.tone === "great"
                ? styles.statusGreat
                : status.tone === "ok"
                ? styles.statusOk
                : styles.statusBad,
            ]}
          >
            {status.tone === "great" ? (
              <Sparkles size={14} color={colors.accent} />
            ) : status.tone === "ok" ? (
              <ThumbsUp size={14} color={colors.accent} />
            ) : (
              <AlertCircle size={14} color={colors.accent} />
            )}
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
          <Text style={styles.deltaText}>
            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} vs χθες
          </Text>
        </View>
      </View>

      <View style={styles.heroRight}>
        <Text style={styles.sectionTitle}>Καλύτερες ώρες</Text>
        <View style={{ gap: 8 }}>
          {bestWindows.map((w) => (
            <View key={w.label} style={styles.timeRow}>
              <Sun size={16} color={colors.accent} />
              <Text style={styles.timeText}>{w.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Contrast size={14} color={colors.accent} />
            <Text style={styles.metaText}>{moonLabel}</Text>
          </View>
          <View style={styles.metaChip}>
            <Sunrise size={14} color={colors.accent} />
            <Text style={styles.metaText}>{tideLabel}</Text>
          </View>
          {/* ΝΕΟ: ώρα δύσης (μέχρι πότε είναι μέρα) */}
          <View style={styles.metaChip}>
            <Sunset size={14} color={colors.accent} />
            <Text style={styles.metaText}>Δύση ηλίου: {sunsetLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    flexDirection: "row",
    gap: 12,
  },
  heroLeft: { alignItems: "center", justifyContent: "center" },
  heroRight: { flex: 1, justifyContent: "space-between", paddingVertical: 6 },

  statusWrap: { alignItems: "center", marginTop: 8 },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusGreat: { backgroundColor: colors.accent },
  statusOk: { backgroundColor: "#EED88D" },
  statusBad: { backgroundColor: "#FF9F7A" },
  statusText: {
    color: colors.primaryBg,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  deltaText: { color: "#9BA3AF", fontSize: 12, marginTop: 6 },

  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: "800" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeText: { color: colors.white, fontSize: 14, fontWeight: "700" },

  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 },
  metaChip: {
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
  metaText: { color: colors.white, fontSize: 12, fontWeight: "600" },
});
