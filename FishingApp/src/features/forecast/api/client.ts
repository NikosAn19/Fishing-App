// src/features/forecast/api/client.ts
import { Platform } from "react-native";
import { API_BASE } from "../../../config/api";
import { DEFAULT_TIMEZONE } from "../../../config/time";
import { JSON_HEADERS } from "../../../utils/apiClient";
import { GetForecastOpts, UnifiedForecast } from "./types";

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

  const url = `${API_BASE}${endpoint}?${params.toString()}`;
  console.log("🌊 Fetching forecast from:", url);
  console.log("🌊 Platform:", Platform.OS);
  console.log("🌊 API_BASE:", API_BASE);
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
    console.log("🌊 Request options:", {
      method: "GET",
      signal: signal ? "AbortSignal present" : "No signal",
      timeout: timeout + "ms",
    });

    console.log("🌊 Full URL:", url);
    const startTime = Date.now();

    // Add more detailed error handling
    const res = await fetch(url, {
      signal,
      method: "GET",
      headers: {
        Accept: "application/json",
        ...JSON_HEADERS,
        "User-Agent": "FishingApp/1.0.0",
        "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
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

    const { meta, current, sun, moon, hourly, rain } = json;
    return { meta, current, sun, moon, hourly, rain } as UnifiedForecast;
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
