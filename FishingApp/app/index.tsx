// app/(drawer)/forecast/index.tsx

import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";

import ForecastHeader from "../src/features/forecast/components/ForecastHeader";
import HeroCard from "../src/features/forecast/components/HeroCard";
import DriversRow from "../src/features/forecast/components/DriversRow";
import AlertBanner from "../src/features/forecast/components/AlertBanner";
import RecommendationsGrid from "../src/features/forecast/components/BreakdownCard"; // ✅ correct import
import SeasonSpeciesCard, {
  SeasonSpecies,
} from "../src/features/forecast/components/SeasonSpeciesCard";

import {
  getStatus,
  BestWindow,
  Driver,
  Recommendation,
  BreakdownItem,
  ForecastAlert,
} from "../src/features/forecast/types";
import { computeScore } from "../src/features/forecast/mappers/toUi";

// Hooks + mappers to backend
import { useCurrentLocation } from "../src/features/forecast/hooks/useCurrentLocation";
import { useForecast } from "../src/features/forecast/hooks/useForecast";
import {
  mapHeader,
  mapHero,
  mapDrivers,
  mapAlert,
  mapRecommendations,
} from "../src/features/forecast/mappers/toUi";
import { useReverseGeocode } from "../src/features/forecast/hooks/useReverseGeocode"; // ✅ reverse geocode

// --- Optional SAMPLE fallbacks (used only when no data yet)
const SAMPLE = {
  location: "Άλιμος, GR",
  dateLabel: "Σάββατο, 7 Σεπ",
  score: 76,
  delta: +8,
  bestWindows: [
    { label: "06:10–08:00", icon: "sunny-outline" as const },
    { label: "18:20–19:40", icon: "moon-outline" as const },
  ] as BestWindow[],
  drivers: [
    {
      icon: "leaf-outline",
      title: "Άνεμος",
      value: "ΒΑ 9–14 kn",
      verdict: "good",
      note: "Πλάγιος/ήπιος",
    },
    {
      icon: "water-outline",
      title: "Κύμα",
      value: "0.6 m @ 7 s",
      verdict: "warn",
      note: "Οριακό για βράχια",
    },
    {
      icon: "thermometer-outline",
      title: "Θερμ. νερού",
      value: "22.4°C",
      verdict: "good",
      note: "Σταθερή",
    },
    {
      icon: "cloud-outline",
      title: "Νεφοκάλυψη",
      value: "30%",
      verdict: "good",
      note: "Μαλακό φως",
    },
    {
      icon: "compass-outline",
      title: "Κατεύθυνση",
      value: "Side/Off",
      verdict: "good",
      note: "Καλή πλεύση",
    },
    {
      icon: "trending-up-outline",
      title: "Πίεση",
      value: "+2.1 hPa/6h",
      verdict: "ok",
      note: "Ελαφρά άνοδος",
    },
  ] as Driver[],
  alert: {
    level: "amber",
    text: "Ριπές 22 kn 15:00–17:00 — απόφυγε εκτεθειμένα βράχια.",
  } as ForecastAlert,
  recommendations: [
    {
      icon: "fish-outline",
      title: "Τεχνική",
      lines: ["Spinning", "Minnow 90–120mm", "Slow retrieve + twitches"],
    },
    {
      icon: "flame-outline",
      title: "Δόλωμα",
      lines: ["Γαρίδα / καραβιδάκι", "Αγκίστρι 1/0–2/0", "Fluoro 0.26–0.30"],
    },
    {
      icon: "map-outline",
      title: "Spot",
      lines: ["Αμμώδες με βραχάκια", "Στόμια λιμανιού", "Ροή παλίρροιας"],
    },
  ] as Recommendation[],
  breakdown: [
    { key: "Άνεμος", weight: 0.25, score: 0.85, color: "#00e6b8" },
    { key: "Κύμα", weight: 0.25, score: 0.55, color: "#39c6ff" },
    { key: "Παλίρροια", weight: 0.15, score: 0.7, color: "#8b78ff" },
    { key: "Θερμ. νερού", weight: 0.1, score: 0.8, color: "#7fdc9b" },
    { key: "Φως/Νέφη", weight: 0.1, score: 0.75, color: "#ffd166" },
    { key: "Πίεση", weight: 0.1, score: 0.6, color: "#ff9f7a" },
    { key: "Σελήνη", weight: 0.05, score: 0.5, color: "#bfbfbf" },
  ] as BreakdownItem[],
  species: [
    {
      code: "aurata",
      name: "Τσιπούρα",
      likelihood: 0.9,
      monthsLabel: "Σεπ–Νοε",
      note: "Δουλεύει με ελαφρύ κυματισμό.",
    },
    {
      code: "labrax",
      name: "Λαβράκι",
      likelihood: 0.7,
      monthsLabel: "Οκτ–Δεκ",
    },
    {
      code: "mullus",
      name: "Μπαρμπούνι",
      likelihood: 0.55,
      monthsLabel: "Μάι–Οκτ",
    },
  ] as SeasonSpecies[],
};

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();

  // 1) Τρέχουσα τοποθεσία συσκευής
  const { coords, loading: locating, error: locErr } = useCurrentLocation();

  // 2) Forecast από backend
  const {
    data,
    loading: loadingForecast,
    error: apiErr,
  } = useForecast(coords?.lat, coords?.lon, "Europe/Athens");

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

      console.log("🎣 Fishing Score:", computeScore(data));
      console.log("🌊 ===== END SERVER DATA =====");
    }
  }, [data]);

  // 3) Reverse geocoding σε "Πόλη, CC"
  const niceLocation = useReverseGeocode(
    data?.meta.lat ?? coords?.lat,
    data?.meta.lon ?? coords?.lon
  );

  // 4) Map σε UI props (fallback σε SAMPLE)
  const header = data
    ? mapHeader(data)
    : { location: SAMPLE.location, dateLabel: SAMPLE.dateLabel };

  const hero = data
    ? mapHero(data)
    : {
        score: SAMPLE.score,
        delta: SAMPLE.delta,
        bestWindows: SAMPLE.bestWindows,
        moonLabel: "—",
        tideLabel: "—",
        sunsetLabel: "—", // ✅ fallback για δύση
      };

  const status = useMemo(() => getStatus(hero.score), [hero.score]);
  const drivers = data ? mapDrivers(data) : SAMPLE.drivers;
  const alert = data ? mapAlert(data) : SAMPLE.alert;
  const recs = data ? mapRecommendations(data) : SAMPLE.recommendations;

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
            location={data || coords ? niceLocation || "—" : SAMPLE.location}
            dateLabel={header.dateLabel}
          />

          {/* Loading */}
          {loading && (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: "#9BA3AF", marginTop: 8 }}>
                Φόρτωση πρόγνωσης…
              </Text>
            </View>
          )}

          {/* Errors as banners */}
          {locErr && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <AlertBanner
                alert={{
                  level: "amber",
                  text: "Δεν δόθηκε άδεια τοποθεσίας. Ενεργοποίησε τα Location Services.",
                }}
              />
            </View>
          )}
          {apiErr && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <AlertBanner
                alert={{
                  level: "red",
                  text: "Σφάλμα ανάκτησης πρόγνωσης. Έλεγξε το API_BASE ή το δίκτυο.",
                }}
              />
            </View>
          )}

          {/* Content */}
          {!loading && (
            <>
              <View style={{ marginBottom: 8 }}>
                <HeroCard
                  score={hero.score}
                  delta={hero.delta}
                  status={status}
                  bestWindows={hero.bestWindows}
                  moonLabel={hero.moonLabel}
                  tideLabel={hero.tideLabel}
                  sunsetLabel={hero.sunsetLabel} // ✅ περνάμε τη δύση
                />
              </View>

              <View style={{ marginBottom: 8 }}>
                <DriversRow drivers={drivers} />
              </View>

              {/* Season/Species (UX-only μέχρι να φτιάξουμε /api/season) */}
              <View style={{ marginBottom: 8 }}>
                <SeasonSpeciesCard
                  monthLabel={new Date().toLocaleDateString("el-GR", {
                    month: "long",
                  })}
                  seasonText="Σεπ – Νοε"
                  species={SAMPLE.species}
                />
              </View>

              {alert && (
                <View style={{ marginBottom: 8 }}>
                  <AlertBanner alert={alert} />
                </View>
              )}

              <View style={{ marginBottom: 8 }}>
                <RecommendationsGrid recommendations={recs} />
              </View>
            </>
          )}
        </ScrollView>
      </View>
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
});
