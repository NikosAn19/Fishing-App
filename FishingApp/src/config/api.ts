// src/config/api.ts
// Centralized API configuration for all API clients
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Current development machine IP address
 * Update this if your IP changes
 */
export const DEV_MACHINE_IP = "192.168.2.4";
const DEV_PORT = 3000;

/**
 * Get the base API URL from environment variables or defaults
 */
function getRawBase(): string {
  // Priority 1: Environment variable (EXPO_PUBLIC_API_BASE)
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }

  // Priority 2: Expo Constants (from app.config.js extra)
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE) {
    return Constants.expoConfig.extra.EXPO_PUBLIC_API_BASE as string;
  }

  // Priority 3: Global expo env shim (for development)
  if ((globalThis as any).__expo?.env?.EXPO_PUBLIC_API_BASE) {
    return (globalThis as any).__expo.env.EXPO_PUBLIC_API_BASE;
  }

  // Priority 4: ngrok URL (for tunnel mode)
  if (process.env.EXPO_PUBLIC_NGROK_URL) {
    return process.env.EXPO_PUBLIC_NGROK_URL;
  }

  // Default: localhost for dev, placeholder for prod
  return __DEV__
    ? `http://${DEV_MACHINE_IP}:${DEV_PORT}`
    : "https://your-prod-api";
}

/**
 * Normalize and adapt the base URL based on platform and environment
 * - Detects tunnel/ngrok URLs and uses them as-is
 * - For Android, replaces localhost/local IPs with the dev machine IP
 * - Ensures consistent IP usage across all API clients
 *
 * IMPORTANT: When running in Expo tunnel mode, API calls to local IPs will fail
 * because the device is not on the same network. Use ngrok or LAN mode instead.
 */
export function normalizeApiBase(base: string): string {
  if (!base) return base;

  let b = base.trim().replace(/\/+$/, ""); // Remove trailing slashes

  if (__DEV__) {
    console.log(
      "🌊 API Config - Original base:",
      base,
      "Platform:",
      Platform.OS
    );
  }

  // If base already contains ngrok URL or https, use it as-is (tunnel mode)
  if (
    b.includes("ngrok") ||
    b.includes("https://") ||
    (b.startsWith("http://") &&
      (b.includes(".ngrok") || b.includes(".exp.direct")))
  ) {
    if (__DEV__) {
      console.log("🌊 API Config - Using tunnel/ngrok URL as-is:", b);
    }
    return b;
  }

  // For Android, replace localhost/local IPs with the dev machine IP
  // BUT: Only if we're NOT in tunnel mode (tunnel mode URLs are already public)
  if (
    Platform.OS === "android" &&
    !b.includes("ngrok") &&
    !b.includes("https://")
  ) {
    // Replace localhost/127.0.0.1 with dev machine IP
    if (b.includes("localhost") || b.includes("127.0.0.1")) {
      b = b
        .replace("localhost", DEV_MACHINE_IP)
        .replace("127.0.0.1", DEV_MACHINE_IP);
      if (__DEV__) {
        console.log(
          `🌊 API Config - Android: localhost -> ${DEV_MACHINE_IP} (dev machine IP)`
        );
      }
    }
    // Replace any local network IPs with dev machine IP
    else if (
      b.includes("192.168.") ||
      b.includes("10.0.2.2") ||
      b.includes("10.120.42.28")
    ) {
      b = b
        .replace(/192\.168\.\d+\.\d+/, DEV_MACHINE_IP)
        .replace("10.0.2.2", DEV_MACHINE_IP)
        .replace("10.120.42.28", DEV_MACHINE_IP);
      if (__DEV__) {
        console.log(
          `🌊 API Config - Android: network IP -> ${DEV_MACHINE_IP} (dev machine IP)`
        );
      }
    }
  }

  if (__DEV__) {
    console.log("🌊 API Config - Final normalized API_BASE:", b);
  }

  // WARNING: If using tunnel mode and local IP, this will fail!
  if (
    b.includes("192.168.") ||
    b.includes("10.120.42.28") ||
    b.includes("10.0.2.2")
  ) {
    if (__DEV__) {
      console.warn(
        "⚠️ WARNING: Using local IP address. If running in tunnel mode, API calls will fail!"
      );
      console.warn("⚠️ Solution: Use ngrok or switch to LAN mode.");
      console.warn(
        "⚠️ To use ngrok: Set EXPO_PUBLIC_API_BASE=https://your-ngrok-url.ngrok-free.app"
      );
    }
  }

  return b;
}

/**
 * Get the normalized API base URL
 * This is the single source of truth for all API calls
 */
export const API_BASE = normalizeApiBase(getRawBase());

if (__DEV__) {
  // Log initialization immediately when module loads (development only)
  console.log("🔧 ===== API CONFIG INITIALIZATION =====");
  console.log("🔧 RAW_BASE:", getRawBase());
  console.log("🔧 API_BASE:", API_BASE);
  console.log("🔧 Platform:", Platform.OS);
  console.log("🔧 __DEV__:", __DEV__);
  console.log(
    "🔧 process.env.EXPO_PUBLIC_API_BASE:",
    process.env.EXPO_PUBLIC_API_BASE
  );
  console.log(
    "🔧 Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE:",
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE
  );
  console.log(
    "🔧 globalThis.__expo?.env?.EXPO_PUBLIC_API_BASE:",
    (globalThis as any).__expo?.env?.EXPO_PUBLIC_API_BASE
  );
  console.log("🔧 ===== END API CONFIG INIT =====\n");
}
