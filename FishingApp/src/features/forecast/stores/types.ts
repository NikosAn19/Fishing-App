import { UnifiedForecast } from "../api/types";

export interface ForecastCacheEntry {
  forecast: UnifiedForecast;
  lastFetched: number; // timestamp in ms
  location: { lat: number; lon: number };
}

export interface ForecastCacheState {
  // Map of location keys to cache entries
  // Key format: `${lat.toFixed(4)}_${lon.toFixed(4)}`
  cache: Record<string, ForecastCacheEntry>;

  // Loading/error states
  loading: boolean;
  error: Error | null;

  // TTL in milliseconds (12 hours)
  ttl: number;
}

export interface ForecastCacheActions {
  /**
   * Get location key from coordinates (rounded to 4 decimals)
   */
  getLocationKey: (lat: number, lon: number) => string;

  /**
   * Check if cache is valid for location (exists and not expired)
   */
  isCacheValid: (lat: number, lon: number) => boolean;

  /**
   * Get cached forecast for location (returns null if not cached or expired)
   */
  getCachedForecast: (lat: number, lon: number) => UnifiedForecast | null;

  /**
   * Store forecast in cache for location
   */
  setCachedForecast: (
    lat: number,
    lon: number,
    forecast: UnifiedForecast
  ) => void;

  /**
   * Fetch forecast and cache it (if not valid or force refresh)
   */
  fetchAndCache: (
    lat: number,
    lon: number,
    forceRefresh?: boolean
  ) => Promise<UnifiedForecast>;

  /**
   * Get forecast for specific day index (0-7) from cached data
   * Returns a modified UnifiedForecast with current data for that day
   */
  getForecastForDay: (
    lat: number,
    lon: number,
    dayIndex: number
  ) => UnifiedForecast | null;

  /**
   * Clear cache for specific location or all locations
   */
  clearCache: (lat?: number, lon?: number) => void;

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => void;

  /**
   * Set error state
   */
  setError: (error: Error | null) => void;
}

export type ForecastCacheStore = ForecastCacheState & {
  actions: ForecastCacheActions;
};
