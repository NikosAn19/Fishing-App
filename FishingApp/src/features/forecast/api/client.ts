// src/features/forecast/api/client.ts
import { Platform } from "react-native";

/** Διαβάζουμε το base από env (Expo), αλλιώς πέφτουμε σε dev/prod defaults */
const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  // @ts-ignore - Expo dev env shim
  (globalThis as any).__expo?.env?.EXPO_PUBLIC_API_BASE ??
  (__DEV__ ? "http://192.168.2.5:3000" : "https://your-prod-api");

/** Κανονικοποίηση base URL + ειδική μεταχείριση για Android emulator */
function normalizeBase(base: string) {
  if (!base) return base;
  let b = base.trim().replace(/\/+$/, ""); // κόψε trailing slashes
  if (
    Platform.OS === "android" &&
    (b.includes("localhost") || b.includes("127.0.0.1"))
  ) {
    // Android emulator -> το host machine φαίνεται ως 10.0.2.2
    b = b.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }
  return b;
}

export const API_BASE = normalizeBase(RAW_BASE);

export type UnifiedForecast = {
  meta: { lat: number; lon: number; tz: string; generatedAt: string };
  current: {
    air: {
      temp_c: number | null;
      pressure_hpa: number | null;
      cloud_pct: number | null;
    };
    wind: {
      speed_kn: number | null;
      dir_deg: number | null;
      dir_cardinal: string | null;
    };
    wave: {
      height_m: number | null;
      period_s: number | null;
      direction_deg: number | null;
      swell_height_m: number | null;
      wind_wave_height_m: number | null;
      sea_temp_c: number | null;
    };
  };
  sun: { sunrise: string; sunset: string; day_length_sec: number };
  moon: { fraction: number; label: string };
  hourly: {
    time: string[];
    wind_speed_kn: (number | null)[];
    wind_dir_deg: (number | null)[];
    wave_height_m: (number | null)[];
    wave_period_s: (number | null)[];
    cloud_pct: (number | null)[];
    pressure_hpa: (number | null)[];
    temp_c: (number | null)[];
  };
};

type GetForecastOpts = {
  /** Παράκαμψε το server cache layer; default: true (δεν στέλνεται) */
  cache?: boolean;
  /** Custom AbortSignal αν το διαχειρίζεσαι απ' έξω */
  signal?: AbortSignal;
  /** Timeout σε ms (default 12s) */
  timeoutMs?: number;
};

export async function getForecast(
  lat: number,
  lon: number,
  tz = "Europe/Athens",
  opts: GetForecastOpts = {}
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    tz,
  });
  if (opts.cache === false) params.set("cache", "false");

  const url = `${API_BASE}/api/forecast?${params.toString()}`;
  console.log("🌊 Fetching forecast from:", url);

  const controller = opts.signal ? undefined : new AbortController();
  const signal = opts.signal ?? controller!.signal;
  const timeout = opts.timeoutMs ?? 12_000; // 12s default
  const timer = controller
    ? setTimeout(() => controller.abort(), timeout)
    : undefined;

  try {
    const res = await fetch(url, { signal });

    // Διάβασε το body είτε είναι 200 είτε όχι για καλύτερο debug
    const text = await res.text().catch(() => "");

    console.log("🌊 Response status:", res.status, res.statusText);

    if (!res.ok) {
      const snippet = text?.slice(0, 400) ?? "";
      console.log("🌊 Forecast error payload:", snippet);
      throw new Error(
        `Forecast HTTP ${res.status} ${res.statusText} – ${snippet}`
      );
    }

    // Αν είναι άδειο, πέτα λάθος
    if (!text) {
      throw new Error("Forecast: empty response body");
    }

    const json = JSON.parse(text);
    console.log("🌊 Forecast data received (keys):", Object.keys(json ?? {}));

    const { meta, current, sun, moon, hourly } = json;
    return { meta, current, sun, moon, hourly } as UnifiedForecast;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
