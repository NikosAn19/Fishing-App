import { DEFAULT_TIMEZONE } from "../../../config/time";
import { UnifiedForecast } from "../api/types";
import { FORECAST_STRINGS } from "../strings";
import {
  BEST_TIME_THRESHOLD,
  computeForecastScore,
  extractBestTimeSlots,
  scaleClouds,
  scaleGood,
  scaleInverse,
} from "../utils/forecastMetrics";
import {
  BestWindow,
  Driver,
  ForecastAlert,
  Recommendation,
  BreakdownItem,
} from "../../forecast/types";

/** Safe formatter για ώρα (π.χ. "19:52") με fallback αν το ISO ή το TZ είναι άκυρα. */
function safeTimeLabel(iso?: string, tz?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—"; // invalid ISO από backend
  try {
    return new Intl.DateTimeFormat("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz || DEFAULT_TIMEZONE,
    }).format(d);
  } catch {
    // Fallback αν λείπει Intl TZ ή είναι άκυρο το TZ
    return d.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

export function mapHeader(f: UnifiedForecast) {
  const date = new Date();
  const dateLabel = date.toLocaleDateString("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const coords = `${f.meta.lat.toFixed(3)}, ${f.meta.lon.toFixed(3)}`;
  return { location: coords, dateLabel };
}

export function mapHero(f: UnifiedForecast) {
  const score = computeForecastScore(f);
  const delta = 0;

  const slots = extractBestTimeSlots(f.hourly, BEST_TIME_THRESHOLD, 2);
  const bestWindows: BestWindow[] =
    slots.length > 0
      ? slots.map((slot, idx) => ({
          label: safeTimeLabel(slot.isoTime, f.meta?.tz),
          icon: idx === 0 ? "sunny-outline" : "moon-outline",
        }))
      : FORECAST_STRINGS.fallbackBestTimes.map((fb) => ({
          label: fb.label,
          icon: fb.icon,
        }));

  const moonLabel = `${FORECAST_STRINGS.moonPhase}: ${Math.round(
    (f.moon.fraction ?? 0) * 100
  )}%`;
  const tideLabel = `${FORECAST_STRINGS.sunrise}: ${safeTimeLabel(
    f.sun?.sunrise,
    f.meta?.tz
  )}`;

  // ✅ ασφαλής μορφοποίηση ώρας δύσης
  const sunsetLabel = safeTimeLabel(f.sun?.sunset, f.meta?.tz);

  return { score, delta, bestWindows, moonLabel, tideLabel, sunsetLabel };
}

export function mapDrivers(f: UnifiedForecast): Driver[] {
  const formatted = f.current.formatted;
  const w = f.current.wind;
  const wave = f.current.wave;

  return [
    {
      icon: "wind",
      title: FORECAST_STRINGS.wind,
      value: formatted.wind.display_beaufort,
      verdict: verdict(w.speed_kn, [0, 20, 30]),
    },
    {
      icon: "waves",
      title: FORECAST_STRINGS.waves,
      value: formatted.wave.display,
      verdict: verdict(wave.height_m, [0, 0.8, 1.2]),
    },
    {
      icon: "thermometer",
      title: FORECAST_STRINGS.airTemp,
      value: formatted.air.temp_display,
      verdict: "ok",
    },
    {
      icon: "droplets",
      title: FORECAST_STRINGS.waterTemp,
      value: formatted.water.temp_display,
      verdict: "ok",
    },
    {
      icon: "cloud",
      title: FORECAST_STRINGS.clouds,
      value: formatted.air.cloud_display,
      verdict: "ok",
    },
    {
      icon: "gauge",
      title: FORECAST_STRINGS.pressure,
      value: formatted.air.pressure_display,
      verdict: "ok",
    },
  ];
}

export function mapAlert(_f: UnifiedForecast): ForecastAlert | null {
  return null;
}

export function mapRecommendations(_f: UnifiedForecast): Recommendation[] {
  return [
    {
      icon: "fish-outline",
      title: FORECAST_STRINGS.recommendations.technique,
      lines: ["Spinning", "Minnow 90–120mm", "Slow retrieve + twitches"],
    },
    {
      icon: "flame-outline",
      title: FORECAST_STRINGS.recommendations.bait,
      lines: ["Γαρίδα / καραβιδάκι", "Αγκίστρι 1/0–2/0", "Fluoro 0.26–0.30"],
    },
  ];
}

export function mapBreakdown(f: UnifiedForecast): {
  total: number;
  items: BreakdownItem[];
} {
  const total = computeForecastScore(f);
  const items: BreakdownItem[] = [
    {
      key: FORECAST_STRINGS.breakdown.wind,
      weight: 0.25,
      score: scaleGood(f.current.wind.speed_kn, [0, 12, 25]),
      color: "#00e6b8",
    },
    {
      key: FORECAST_STRINGS.breakdown.waves,
      weight: 0.25,
      score: scaleInverse(f.current.wave.height_m, [0.2, 0.8, 1.4]),
      color: "#39c6ff",
    },
    {
      key: FORECAST_STRINGS.breakdown.clouds,
      weight: 0.1,
      score: scaleClouds(f.current.air.cloud_pct),
      color: "#ffd166",
    },
    {
      key: FORECAST_STRINGS.breakdown.pressure,
      weight: 0.1,
      score: 0.6,
      color: "#ff9f7a",
    },
    {
      key: FORECAST_STRINGS.breakdown.moon,
      weight: 0.05,
      score: 0.5,
      color: "#bfbfbf",
    },
    {
      key: FORECAST_STRINGS.breakdown.temp,
      weight: 0.1,
      score: 0.8,
      color: "#7fdc9b",
    },
    {
      key: FORECAST_STRINGS.breakdown.swell,
      weight: 0.15,
      score: 0.7,
      color: "#8b78ff",
    },
  ];
  return { total, items };
}

/**
 * Map rain data for UI display
 */
export function mapRain(f: UnifiedForecast): {
  currentStatus: string;
  todayForecast: string;
  dailyForecast: Array<{
    date: string;
    display: string;
    willRain: boolean;
    pop: number;
  }>;
} {
  const rain = f.rain;
  if (!rain) {
    return {
      currentStatus: "—",
      todayForecast: "—",
      dailyForecast: [],
    };
  }

  return {
    currentStatus: rain.formatted?.current || "—",
    todayForecast: rain.formatted?.today || "—",
    dailyForecast: rain.daily.map((d, idx) => ({
      date: d.date,
      display: rain.formatted?.daily?.[idx] || "—",
      willRain: d.willRain,
      pop: d.pop,
    })),
  };
}

/* heuristics */
function verdict(
  val: number | null | undefined,
  [ok, warn, bad]: [number, number, number]
) {
  if (val == null) return "ok";
  if (val <= warn) return "good";
  if (val <= bad) return "ok";
  return "warn";
}
