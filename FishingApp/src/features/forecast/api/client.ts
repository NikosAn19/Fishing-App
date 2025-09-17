// src/features/forecast/api/client.ts
import { Platform } from "react-native";

/** Διαβάζουμε το base από env (Expo), αλλιώς πέφτουμε σε dev/prod defaults */
const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  // @ts-ignore - Expo dev env shim
  (globalThis as any).__expo?.env?.EXPO_PUBLIC_API_BASE ??
  (__DEV__ ? "http://localhost:3000" : "https://your-prod-api");

console.log("🔧 RAW_BASE from env:", RAW_BASE);
console.log(
  "🔧 process.env.EXPO_PUBLIC_API_BASE:",
  process.env.EXPO_PUBLIC_API_BASE
);
console.log("🔧 __DEV__:", __DEV__);

/** Κανονικοποίηση base URL + ειδική μεταχείριση για Android emulator */
function normalizeBase(base: string) {
  if (!base) return base;
  let b = base.trim().replace(/\/+$/, ""); // κόψε trailing slashes

  console.log("🌊 Original base:", base, "Platform:", Platform.OS);

  // Για Android, δοκίμασε διάφορες επιλογές
  if (Platform.OS === "android") {
    // Αντικατάστασε localhost/127.0.0.1 με το mobile hotspot IP
    if (b.includes("localhost") || b.includes("127.0.0.1")) {
      b = b
        .replace("localhost", "10.120.42.28")
        .replace("127.0.0.1", "10.120.42.28");
      console.log("🌊 Android: localhost -> 10.120.42.28 (mobile hotspot IP)");
    }
    // Αντικατάστασε local network IPs με το mobile hotspot IP
    else if (b.includes("192.168.") || b.includes("10.120.42.28")) {
      b = b
        .replace(/192\.168\.\d+\.\d+/, "10.120.42.28")
        .replace("10.120.42.28", "10.120.42.28");
      console.log("🌊 Android: network IP -> 10.120.42.28 (mobile hotspot IP)");
    }
  }

  console.log("🌊 Final normalized API_BASE:", b);
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
  console.log("🌊 Platform:", Platform.OS);
  console.log("🌊 API_BASE:", API_BASE);

  const controller = opts.signal ? undefined : new AbortController();
  const signal = opts.signal ?? controller!.signal;
  const timeout = opts.timeoutMs ?? 12_000; // 12s default
  const timer = controller
    ? setTimeout(() => {
        console.log("🌊 Request timeout after", timeout, "ms - aborting");
        controller.abort();
      }, timeout)
    : undefined;

  try {
    console.log("🌊 Starting fetch request...");
    console.log("🌊 Request options:", {
      method: "GET",
      signal: signal ? "AbortSignal present" : "No signal",
      timeout: timeout + "ms",
    });

    // Test basic connectivity first
    console.log("🌊 Testing basic connectivity to", API_BASE);
    console.log("🌊 Full URL:", url);

    // Try a simple health check first
    try {
      const healthUrl = `${API_BASE}/health`;
      console.log("🌊 Testing health endpoint:", healthUrl);
      const healthRes = await fetch(healthUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
        cache: "no-cache",
      });
      console.log("🌊 Health check status:", healthRes.status);
      if (healthRes.ok) {
        const healthData = await healthRes.text();
        console.log("🌊 Health check response:", healthData);
      }
    } catch (healthError) {
      console.log("🌊 Health check failed:", healthError);
    }

    const startTime = Date.now();

    // Add more detailed error handling
    const res = await fetch(url, {
      signal,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "FishingApp/1.0.0",
      },
      // Add these options for better compatibility
      mode: "cors",
      cache: "no-cache",
    });

    const endTime = Date.now();

    console.log(
      "🌊 Fetch completed in",
      endTime - startTime,
      "ms, status:",
      res.status
    );

    // Διάβασε το body είτε είναι 200 είτε όχι για καλύτερο debug
    const text = await res.text().catch((e) => {
      console.log("🌊 Error reading response text:", e);
      return "";
    });

    console.log("🌊 Response status:", res.status, res.statusText);
    console.log("🌊 Response text length:", text.length);

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
  } catch (error) {
    console.log("🌊 Fetch error:", error);
    console.log("🌊 Error type:", typeof error);
    console.log(
      "🌊 Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.log(
      "🌊 Error message:",
      error instanceof Error ? error.message : String(error)
    );

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log(
          "🌊 Request was aborted - likely due to timeout or manual abort"
        );
      } else if (error.message.includes("Network request failed")) {
        console.log(
          "🌊 Network request failed - check if server is running and accessible"
        );
      } else if (error.message.includes("fetch")) {
        console.log("🌊 Fetch API error - possible network or server issue");
      }
    }

    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
