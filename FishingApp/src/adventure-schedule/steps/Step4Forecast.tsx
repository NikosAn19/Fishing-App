import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import {
  Cloud,
  Wind,
  Waves,
  Thermometer,
  Gauge,
  RefreshCw,
  MapPin,
  Timer,
  TrendingUp,
  Droplets,
} from "lucide-react-native";
import { useReverseGeocode } from "../../features/location/hooks/useReverseGeocode";
import { useForecast } from "../../features/forecast/hooks/useForecast";
import ForecastScoreCard from "../../components/ForecastScoreCard";
import {
  computeForecastScore,
  extractBestTimeSlots,
} from "../../features/forecast/utils/forecastMetrics";
import {
  WeatherHighlights,
  BestTimesSection,
  SunMoonSection,
  FishingDetailsSection,
} from "../components/ForecastSections";
import OutOfRangeNotice from "../components/OutOfRangeNotice";
import { formatIsoTime, formatLongDate, formatWind } from "../utils/helpers";

interface Step4ForecastProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  selectedDate: string;
  fishingDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
  onBackToEdit: () => void;
}

export default function Step4Forecast({
  coordinates,
  selectedDate,
  fishingDetails,
  onBackToEdit,
}: Step4ForecastProps) {
  const { latitude, longitude } = coordinates;

  const { isOutOfRange, maxDateLabel } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(selectedDate + "T00:00:00");
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    return {
      isOutOfRange: requestedDate > maxDate,
      maxDateLabel: maxDate.toLocaleDateString("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }, [selectedDate]);

  const locationName = useReverseGeocode(latitude, longitude);

  const {
    data: forecastData,
    loading,
    error,
    refetch,
  } = useForecast(latitude, longitude, {
    tz: "Europe/Athens",
    date: selectedDate,
    skip: isOutOfRange,
  });

  const fishingScore = forecastData ? computeForecastScore(forecastData) : 0;
  const bestTimeSlots = useMemo(
    () =>
      extractBestTimeSlots(forecastData?.hourly, undefined, 3).map((slot) => ({
        label: formatIsoTime(slot.isoTime),
        score: slot.score,
        icon: <Timer size={14} color={colors.white} strokeWidth={2.5} />,
      })),
    [forecastData]
  );

  const weatherItems = useMemo(() => {
    if (!forecastData) return [];
    return [
      {
        key: "wind",
        icon: <Wind size={20} color={colors.white} strokeWidth={2.5} />,
        value: formatWind(
          forecastData.current?.wind?.speed_kn,
          forecastData.current?.wind?.dir_cardinal
        ),
        label: "Άνεμος",
      },
      {
        key: "waves",
        icon: <Waves size={20} color={colors.white} strokeWidth={2.5} />,
        value:
          forecastData.current?.wave?.height_m != null
            ? `${forecastData.current.wave.height_m.toFixed(1)}m`
            : "—",
        label: "Κύμα",
      },
      {
        key: "air",
        icon: <Thermometer size={20} color={colors.white} strokeWidth={2.5} />,
        value:
          forecastData.current?.air?.temp_c != null
            ? `${forecastData.current.air.temp_c.toFixed(1)}°`
            : "—",
        label: "Αέρας",
      },
      {
        key: "water",
        icon: <Droplets size={20} color={colors.white} strokeWidth={2.5} />,
        value:
          forecastData.current?.wave?.sea_temp_c != null
            ? `${forecastData.current.wave.sea_temp_c.toFixed(1)}°`
            : "—",
        label: "Νερό",
      },
      {
        key: "clouds",
        icon: <Cloud size={20} color={colors.white} strokeWidth={2.5} />,
        value:
          forecastData.current?.air?.cloud_pct != null
            ? `${Math.round(forecastData.current.air.cloud_pct)}%`
            : "—",
        label: "Νέφη",
      },
      {
        key: "pressure",
        icon: <Gauge size={20} color={colors.white} strokeWidth={2.5} />,
        value:
          forecastData.current?.air?.pressure_hpa != null
            ? `${Math.round(forecastData.current.air.pressure_hpa)}`
            : "—",
        label: "Πίεση",
      },
    ];
  }, [forecastData]);

  const sunMoonInfo = useMemo(() => {
    const sunriseLabel = forecastData?.sun?.sunrise
      ? formatIsoTime(forecastData.sun.sunrise)
      : "—";
    const sunsetLabel = forecastData?.sun?.sunset
      ? formatIsoTime(forecastData.sun.sunset)
      : "—";
    const moonLabel = forecastData?.moon?.label || "—";

    return { sunriseLabel, sunsetLabel, moonLabel };
  }, [forecastData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Φόρτωση πρόγνωσης...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Αποτυχία φόρτωσης</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <RefreshCw size={20} color={colors.white} />
          <Text style={styles.retryButtonText}>Δοκιμή ξανά</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!forecastData && !loading && isOutOfRange) {
    return (
      <OutOfRangeNotice maxDateLabel={maxDateLabel} onEdit={onBackToEdit} />
    );
  }

  if (!forecastData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Δεν υπάρχουν διαθέσιμα δεδομένα</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Πρόγνωση</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={refetch} style={styles.refreshButton}>
          <RefreshCw size={20} color={colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ForecastScoreCard
        score={fishingScore}
        showScoreOutOf={true}
        header={
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>ΗΜΕΡΟΜΗΝΙΑ</Text>
              <Text style={styles.dateText}>
                {formatLongDate(selectedDate)}
              </Text>
            </View>
            <View style={styles.trendIcon}>
              <TrendingUp size={20} color={colors.white} strokeWidth={2.5} />
            </View>
          </View>
        }
      >
        <View style={styles.divider} />

        <WeatherHighlights items={weatherItems} />

        <BestTimesSection slots={bestTimeSlots} />

        <SunMoonSection info={sunMoonInfo} />
      </ForecastScoreCard>

      <FishingDetailsSection details={fishingDetails ?? null} />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 32,
  },
  errorText: {
    color: colors.warning,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetail: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.8,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  trendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay10,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.overlay10,
    marginVertical: 20,
  },
});
