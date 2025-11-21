import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Sun, Moon, Fish, FileText } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { FORECAST_STRINGS } from "../../forecast/strings";

type WeatherItem = {
  key: string;
  icon: React.ReactNode;
  value: string;
  label: string;
};

type BestTimeSlot = {
  label: string;
  score: number;
  icon?: React.ReactNode;
};

type SunMoonInfo = {
  sunriseLabel: string;
  sunsetLabel: string;
  moonLabel: string;
};

type FishingDetails = {
  technique?: string;
  lures?: string[];
  notes?: string;
} | null;

export function WeatherHighlights({ items }: { items: WeatherItem[] }) {
  return (
    <View style={styles.weatherGrid}>
      {items.map((item) => (
        <View key={item.key} style={styles.weatherItem}>
          {item.icon}
          <Text style={styles.weatherValue}>{item.value}</Text>
          <Text style={styles.weatherLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function BestTimesSection({ slots }: { slots: BestTimeSlot[] }) {
  if (!slots.length) return null;

  return (
    <>
      <View style={styles.divider} />
      <View style={styles.bestTimesSection}>
        <Text style={styles.bestTimesTitle}>{FORECAST_STRINGS.bestTimes}</Text>
        <View style={styles.bestTimesGrid}>
          {slots.map((slot, index) => (
            <View key={`${slot.label}-${index}`} style={styles.bestTimeChip}>
              {slot.icon}
              <Text style={styles.bestTimeText}>{slot.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

export function SunMoonSection({ info }: { info: SunMoonInfo }) {
  return (
    <>
      <View style={styles.divider} />
      <View style={styles.sunMoonSection}>
        <View style={styles.sunMoonRow}>
          <View style={styles.sunMoonItem}>
            <Sun size={18} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.sunMoonText}>
              {FORECAST_STRINGS.sunriseLabel}: {info.sunriseLabel}
            </Text>
          </View>
          <View style={styles.sunMoonItem}>
            <Sun size={18} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.sunMoonText}>
              {FORECAST_STRINGS.sunsetLabel}: {info.sunsetLabel}
            </Text>
          </View>
        </View>
        <View style={styles.moonRow}>
          <Moon size={18} color={colors.white} strokeWidth={2.5} />
          <Text style={styles.sunMoonText}>{info.moonLabel}</Text>
        </View>
      </View>
    </>
  );
}

export function FishingDetailsSection({
  details,
}: {
  details: FishingDetails;
}) {
  if (
    !details ||
    (!details.technique && !details.lures?.length && !details.notes)
  ) {
    return null;
  }

  return (
    <View style={styles.detailsCard}>
      <Text style={styles.detailsTitle}>Σχέδιο Περιπέτειας</Text>

      {details.technique && (
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Fish size={18} color={colors.accent} strokeWidth={2.5} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Τεχνική</Text>
            <Text style={styles.detailValue}>{details.technique}</Text>
          </View>
        </View>
      )}

      {details.lures && details.lures.length > 0 && (
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Fish size={18} color={colors.accent} strokeWidth={2.5} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Δολώματα</Text>
            <Text style={styles.detailValue}>{details.lures.join(", ")}</Text>
          </View>
        </View>
      )}

      {details.notes && (
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <FileText size={18} color={colors.accent} strokeWidth={2.5} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Σημειώσεις</Text>
            <Text style={styles.detailValue}>{details.notes}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  weatherItem: {
    width: (Dimensions.get("window").width - 80) / 3,
    alignItems: "center",
    gap: 6,
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  weatherLabel: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.7,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.overlay10,
    marginVertical: 20,
  },
  bestTimesSection: {
    gap: 12,
  },
  bestTimesTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.2,
  },
  bestTimesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bestTimeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.overlay10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bestTimeText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: "600",
  },
  sunMoonSection: {
    gap: 12,
  },
  sunMoonRow: {
    flexDirection: "row",
    gap: 12,
  },
  sunMoonItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sunMoonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
    opacity: 0.85,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.secondaryBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
});
