import { UnifiedForecast } from "../api/client";
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
      timeZone: tz || "Europe/Athens",
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
      : [
          { label: "06:00–08:00", icon: "sunny-outline" },
          { label: "18:30–19:45", icon: "moon-outline" },
        ];

  const moonLabel = `Φάση σελήνης: ${Math.round(
    (f.moon.fraction ?? 0) * 100
  )}%`;
  const tideLabel = `Ανατολή ηλίου: ${safeTimeLabel(
    f.sun?.sunrise,
    f.meta?.tz
  )}`;

  // ✅ ασφαλής μορφοποίηση ώρας δύσης
  const sunsetLabel = safeTimeLabel(f.sun?.sunset, f.meta?.tz);

  return { score, delta, bestWindows, moonLabel, tideLabel, sunsetLabel };
}

export function mapDrivers(f: UnifiedForecast): Driver[] {
  const w = f.current.wind;
  const wave = f.current.wave;
  const air = f.current.air;

  const windStr = `${w.dir_cardinal ?? ""} ${Math.round(
    w.speed_kn ?? 0
  )} kn`.trim();
  const waveStr = `${(wave.height_m ?? 0).toFixed(1)} m @ ${Math.round(
    wave.period_s ?? 0
  )} s`;

  return [
    {
      icon: "wind",
      title: "Άνεμος",
      value: windStr,
      verdict: verdict(w.speed_kn, [0, 20, 30]),
    },
    {
      icon: "waves",
      title: "Κύμα",
      value: waveStr,
      verdict: verdict(wave.height_m, [0, 0.8, 1.2]),
    },
    {
      icon: "thermometer",
      title: "Θερμ. αέρα",
      value: air.temp_c != null ? `${air.temp_c.toFixed(1)}°C` : "—",
      verdict: "ok",
    },
    {
      icon: "droplets",
      title: "Θερμ. νερού",
      value: wave.sea_temp_c != null ? `${wave.sea_temp_c.toFixed(1)}°C` : "—",
      verdict: "ok",
    },
    {
      icon: "cloud",
      title: "Νεφοκάλυψη",
      value: air.cloud_pct != null ? `${Math.round(air.cloud_pct)}%` : "—",
      verdict: "ok",
    },
    {
      icon: "gauge",
      title: "Πίεση",
      value:
        air.pressure_hpa != null ? `${Math.round(air.pressure_hpa)} hPa` : "—",
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
      title: "Τεχνική",
      lines: ["Spinning", "Minnow 90–120mm", "Slow retrieve + twitches"],
    },
    {
      icon: "flame-outline",
      title: "Δόλωμα",
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
      key: "Άνεμος",
      weight: 0.25,
      score: scaleGood(f.current.wind.speed_kn, [0, 12, 25]),
      color: "#00e6b8",
    },
    {
      key: "Κύμα",
      weight: 0.25,
      score: scaleInverse(f.current.wave.height_m, [0.2, 0.8, 1.4]),
      color: "#39c6ff",
    },
    {
      key: "Νέφη",
      weight: 0.1,
      score: scaleClouds(f.current.air.cloud_pct),
      color: "#ffd166",
    },
    { key: "Πίεση", weight: 0.1, score: 0.6, color: "#ff9f7a" },
    { key: "Σελήνη", weight: 0.05, score: 0.5, color: "#bfbfbf" },
    { key: "Θερμ.", weight: 0.1, score: 0.8, color: "#7fdc9b" },
    { key: "Swell", weight: 0.15, score: 0.7, color: "#8b78ff" },
  ];
  return { total, items };
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
