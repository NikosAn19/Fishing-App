// app/(drawer)/forecast/index.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

import ForecastHeader from "../src/features/forecast/components/ForecastHeader";
import HeroCard from "../src/features/forecast/components/HeroCard";
import DriversRow from "../src/features/forecast/components/DriversRow";
import AlertBanner from "../src/features/forecast/components/AlertBanner";
import RecommendationsGrid from "../src/features/forecast/components/BreakdownCard"; // ✅ correct import
import ErrorState from "../src/components/ErrorState";

import {
  getStatus,
  Driver,
  Recommendation,
  BreakdownItem,
  ForecastAlert,
} from "../src/features/forecast/types";
import { computeForecastScore } from "../src/features/forecast/utils/forecastMetrics";

// Hooks + mappers to backend
import { useCurrentLocation } from "../src/features/location/hooks/useCurrentLocation";
import { useForecast } from "../src/features/forecast/hooks/useForecast";
import {
  mapHeader,
  mapHero,
  mapDrivers,
  mapAlert,
  mapRecommendations,
} from "../src/features/forecast/mappers/toUi";
import AdventureScheduleModal from "../src/adventure-schedule/AdventureScheduleModal";
import { Compass } from "lucide-react-native";

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();
  const [showAdventureWizard, setShowAdventureWizard] = useState(false);

  // 1) Τρέχουσα τοποθεσία συσκευής
  const { coords, loading: locating, error: locErr } = useCurrentLocation();

  // 2) Forecast από backend
  const {
    data,
    loading: loadingForecast,
    error: apiErr,
  } = useForecast(coords?.lat, coords?.lon, { tz: "Europe/Athens" });

  // 📊 Debug: Display all server data when received
  React.useEffect(() => {
    if (data) {
      console.log("🌊 ===== SERVER DATA RECEIVED =====");
      console.log("📍 Location:", {
        lat: data.meta.lat,
        lon: data.meta.lon,
        timezone: data.meta.tz,
        generatedAt: data.meta.generatedAt,
      });

      console.log("🌤️ Current Weather:");
      console.log("  🌡️ Air:", {
        temperature: `${data.current.air.temp_c}°C (θερμοκρασία αέρα)`,
        pressure: `${data.current.air.pressure_hpa} hPa`,
        clouds: `${data.current.air.cloud_pct}%`,
      });
      console.log("  💨 Wind:", {
        speed: `${data.current.wind.speed_kn} kn`,
        direction: `${data.current.wind.dir_deg}° (${data.current.wind.dir_cardinal})`,
      });
      console.log("  🌊 Waves:", {
        height: `${data.current.wave.height_m} m`,
        period: `${data.current.wave.period_s} s`,
        direction: `${data.current.wave.direction_deg}°`,
        swell: `${data.current.wave.swell_height_m} m`,
        windWave: `${data.current.wave.wind_wave_height_m} m`,
        seaTemp: `${data.current.wave.sea_temp_c}°C (θερμοκρασία νερού)`,
      });

      console.log("☀️ Sun/Moon:");
      console.log("  🌅 Sunrise:", data.sun.sunrise);
      console.log("  🌇 Sunset:", data.sun.sunset);
      console.log(
        "  ⏱️ Day Length:",
        `${Math.round(data.sun.day_length_sec / 3600)}h ${Math.round(
          (data.sun.day_length_sec % 3600) / 60
        )}m`
      );
      console.log("  🌙 Moon:", {
        phase: `${Math.round(data.moon.fraction * 100)}%`,
        label: data.moon.label,
      });

      console.log("📈 Hourly Data (24h):");
      console.log(
        "  ⏰ Times:",
        data.hourly.time.slice(0, 5),
        "...",
        data.hourly.time.slice(-2)
      );
      console.log(
        "  💨 Wind Speed:",
        data.hourly.wind_speed_kn.slice(0, 5),
        "...",
        data.hourly.wind_speed_kn.slice(-2)
      );
      console.log(
        "  🌊 Wave Height:",
        data.hourly.wave_height_m.slice(0, 5),
        "...",
        data.hourly.wave_height_m.slice(-2)
      );
      console.log(
        "  🌡️ Temperature:",
        data.hourly.temp_c.slice(0, 5),
        "...",
        data.hourly.temp_c.slice(-2)
      );
      console.log(
        "  ☁️ Cloud Cover:",
        data.hourly.cloud_pct.slice(0, 5),
        "...",
        data.hourly.cloud_pct.slice(-2)
      );

      console.log("🎣 Fishing Score:", computeForecastScore(data));
      console.log("🌊 ===== END SERVER DATA =====");
    }
  }, [data]);

  // 3) Map σε UI props
  const header = data ? mapHeader(data) : null;
  const hero = data ? mapHero(data) : null;
  const status = useMemo(() => (hero ? getStatus(hero.score) : null), [hero]);
  const drivers = data ? mapDrivers(data) : [];
  const alert = data ? mapAlert(data) : null;
  const recs = data ? mapRecommendations(data) : [];

  const loading = locating || loadingForecast;

  return (
    <View style={styles.container}>
      <View style={[styles.contentArea, { marginBottom: insets.bottom }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header — δείχνουμε την "ωραία" τοποθεσία από reverse geocode */}
          <ForecastHeader
            lat={data?.meta.lat ?? coords?.lat}
            lon={data?.meta.lon ?? coords?.lon}
            dateLabel={header?.dateLabel ?? "—"}
          />

          {/* Start Adventure Button - only show when data is available */}
          {data && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => setShowAdventureWizard(true)}
                style={[
                  styles.adventureButton,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Compass size={20} color={colors.white} />
                <Text style={styles.adventureButtonText}>Start Adventure</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginHorizontal: 16,
                marginVertical: 8,
                borderRadius: 16,
                backgroundColor: colors.secondaryBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                Φόρτωση πρόγνωσης…
              </Text>
            </View>
          )}

          {/* Errors as banners */}
          {locErr && (
            <AlertBanner
              alert={{
                level: "amber",
                text: "Δεν δόθηκε άδεια τοποθεσίας. Ενεργοποίησε τα Location Services.",
              }}
            />
          )}
          {apiErr && (
            <AlertBanner
              alert={{
                level: "red",
                text: "Σφάλμα ανάκτησης πρόγνωσης. Έλεγξε το API_BASE ή το δίκτυο.",
              }}
            />
          )}

          {/* Content */}
          {!loading && !data && <ErrorState />}

          {/* Content when data is available */}
          {!loading && data && (
            <>
              {hero && status && (
                <HeroCard
                  score={hero.score}
                  delta={hero.delta}
                  status={status}
                  bestWindows={hero.bestWindows}
                  moonLabel={hero.moonLabel}
                  tideLabel={hero.tideLabel}
                  sunsetLabel={hero.sunsetLabel}
                />
              )}

              {drivers.length > 0 && <DriversRow drivers={drivers} />}

              {alert && <AlertBanner alert={alert} />}

              {recs.length > 0 && (
                <RecommendationsGrid recommendations={recs} />
              )}
            </>
          )}
        </ScrollView>
      </View>

      {/* Adventure Schedule Wizard Modal */}
      <AdventureScheduleModal
        visible={showAdventureWizard}
        onClose={() => setShowAdventureWizard(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBg },
  contentArea: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    marginBottom: 80,
    overflow: "hidden",
  },
  adventureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    minHeight: 56,
  },
  adventureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
