// src/features/forecast/api/client.ts
import { Platform } from "react-native";
import { API_BASE } from "../../../config/api";
import { DEFAULT_TIMEZONE } from "../../../config/time";
import { apiFetchJson } from "../../../utils/apiClient";
import { GetForecastOpts, UnifiedForecast } from "../types/forecastApiTypes";

export async function getForecast(
  lat: number,
  lon: number,
  tz = DEFAULT_TIMEZONE,
  date?: string,
  opts: GetForecastOpts = {}
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    tz,
  });

  // Use date endpoint if date is provided
  const endpoint = date ? "/api/forecast/date" : "/api/forecast";
  if (date) {
    params.set("date", date);
  }

  if (opts.cache === false) params.set("cache", "false");

  const path = `${endpoint}?${params.toString()}`;
  const url = `${API_BASE}${path}`;
  
  console.log("🌊 Fetching forecast from:", url);
  if (date) {
    console.log("🌊 Date parameter:", date);
  }

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
    const startTime = Date.now();

    // Use centralized apiFetchJson which handles:
    // 1. Auth headers (if available)
    // 2. Token refreshing (on 401)
    // 3. ngrok-skip-browser-warning header
    // 4. JSON parsing and error handling
    const data = await apiFetchJson<UnifiedForecast>(path, {
      signal,
      method: "GET",
      // Pass timeout to fetch if supported, or rely on abort controller
    });

    const endTime = Date.now();
    console.log(
      "🌊 Fetch completed in",
      endTime - startTime,
      "ms"
    );

    console.log("🌊 Forecast data received (keys):", Object.keys(data ?? {}));

    const { meta, current, sun, moon, hourly, rain } = data;
    return { meta, current, sun, moon, hourly, rain } as UnifiedForecast;
  } catch (error) {
    console.log("🌊 Fetch error:", error);
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
      }
    }

    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
