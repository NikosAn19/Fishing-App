import { create } from "zustand";
import { UnifiedForecast } from "../api/types";
import { getForecast } from "../api/client";
import { DEFAULT_TIMEZONE } from "../../../config/time";
import {
  ForecastCacheState,
  ForecastCacheActions,
  ForecastCacheStore,
  ForecastCacheEntry,
} from "./types";
import {
  formatWindSpeed,
  formatWave,
  formatTemperature,
  formatPressure,
  formatCloud,
  degToCardinalGreek,
} from "../utils/formatters";

const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const initialState: ForecastCacheState = {
  cache: {},
  loading: false,
  error: null,
  ttl: TTL_MS,
};

export const useForecastCacheStore = create<ForecastCacheStore>((set, get) => ({
  ...initialState,
  actions: {
    getLocationKey: (lat: number, lon: number) => {
      return `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    },

    isCacheValid: (lat: number, lon: number) => {
      const { cache, ttl } = get();
      const key = get().actions.getLocationKey(lat, lon);
      const entry = cache[key];

      if (!entry) return false;

      const now = Date.now();
      const age = now - entry.lastFetched;
      return age < ttl;
    },

    getCachedForecast: (lat: number, lon: number) => {
      const { cache } = get();
      const key = get().actions.getLocationKey(lat, lon);
      const entry = cache[key];

      if (!entry) return null;

      // Check if expired
      if (!get().actions.isCacheValid(lat, lon)) {
        // Remove expired entry
        set((state) => {
          const newCache = { ...state.cache };
          delete newCache[key];
          return { cache: newCache };
        });
        return null;
      }

      return entry.forecast;
    },

    setCachedForecast: (
      lat: number,
      lon: number,
      forecast: UnifiedForecast
    ) => {
      const key = get().actions.getLocationKey(lat, lon);
      const entry: ForecastCacheEntry = {
        forecast,
        lastFetched: Date.now(),
        location: { lat, lon },
      };

      set((state) => ({
        cache: {
          ...state.cache,
          [key]: entry,
        },
      }));
    },

    fetchAndCache: async (lat: number, lon: number, forceRefresh = false) => {
      const { actions } = get();

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = actions.getCachedForecast(lat, lon);
        if (cached) {
          console.log("🌊 Using cached forecast for", lat, lon);
          return cached;
        }
      }

      // Fetch from API
      set({ loading: true, error: null });
      try {
        console.log("🌊 Fetching forecast from API for", lat, lon);
        const forecast = await getForecast(lat, lon, DEFAULT_TIMEZONE);

        // Cache it
        actions.setCachedForecast(lat, lon, forecast);

        set({ loading: false });
        return forecast;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("🌊 Forecast fetch error:", err);
        set({ loading: false, error: err });
        throw err;
      }
    },

    getForecastForDay: (lat: number, lon: number, dayIndex: number) => {
      const cached = get().actions.getCachedForecast(lat, lon);
      if (!cached) return null;

      // For day 0 (today), return as-is
      if (dayIndex === 0) {
        return cached;
      }

      // For future days, extract data for that specific day
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayIndex);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Filter hourly data for the selected day
      const hourlyIndices: number[] = [];
      cached.hourly.time.forEach((timeStr, idx) => {
        const timeDate = new Date(timeStr);
        if (timeDate >= targetDate && timeDate < nextDay) {
          hourlyIndices.push(idx);
        }
      });

      if (hourlyIndices.length === 0) {
        // No hourly data for this day, return null
        return null;
      }

      // Extract hourly data for selected day
      const filteredHourly = {
        time: hourlyIndices.map((i) => cached.hourly.time[i]),
        wind_speed_kn: hourlyIndices.map((i) => cached.hourly.wind_speed_kn[i]),
        wind_dir_deg: hourlyIndices.map((i) => cached.hourly.wind_dir_deg[i]),
        wave_height_m: hourlyIndices.map((i) => cached.hourly.wave_height_m[i]),
        wave_period_s: hourlyIndices.map((i) => cached.hourly.wave_period_s[i]),
        cloud_pct: hourlyIndices.map((i) => cached.hourly.cloud_pct[i]),
        pressure_hpa: hourlyIndices.map((i) => cached.hourly.pressure_hpa[i]),
        temp_c: hourlyIndices.map((i) => cached.hourly.temp_c[i]),
        weather_condition: hourlyIndices.map(
          (i) =>
            cached.hourly.weather_condition?.[i] ??
            cached.current.weather_condition
        ),
        weather_main: hourlyIndices.map(
          (i) => cached.hourly.weather_main?.[i] ?? cached.current.weather_main
        ),
        weather_description: hourlyIndices.map(
          (i) =>
            cached.hourly.weather_description?.[i] ??
            cached.current.weather_description
        ),
        weather_icon: hourlyIndices.map(
          (i) => cached.hourly.weather_icon?.[i] ?? cached.current.weather_icon
        ),
      };

      // Calculate representative values for the selected day
      // Use first hour of the day (or average if preferred)
      const representativeIndex = hourlyIndices[0];

      // Calculate averages for better representation
      const validWindSpeeds = filteredHourly.wind_speed_kn.filter(
        (v): v is number => v != null
      );
      const validWindDirs = filteredHourly.wind_dir_deg.filter(
        (v): v is number => v != null
      );
      const validWaveHeights = filteredHourly.wave_height_m.filter(
        (v): v is number => v != null
      );
      const validWavePeriods = filteredHourly.wave_period_s.filter(
        (v): v is number => v != null
      );
      const validClouds = filteredHourly.cloud_pct.filter(
        (v): v is number => v != null
      );
      const validPressures = filteredHourly.pressure_hpa.filter(
        (v): v is number => v != null
      );
      const validTemps = filteredHourly.temp_c.filter(
        (v): v is number => v != null
      );

      // Use average values for current conditions
      const currentWindSpeed =
        validWindSpeeds.length > 0
          ? validWindSpeeds.reduce((a, b) => a + b, 0) / validWindSpeeds.length
          : cached.hourly.wind_speed_kn[representativeIndex];
      const currentWindDir =
        validWindDirs.length > 0
          ? Math.round(
              validWindDirs.reduce((a, b) => a + b, 0) / validWindDirs.length
            )
          : cached.hourly.wind_dir_deg[representativeIndex];
      const currentWaveHeight =
        validWaveHeights.length > 0
          ? validWaveHeights.reduce((a, b) => a + b, 0) /
            validWaveHeights.length
          : cached.hourly.wave_height_m[representativeIndex];
      const currentWavePeriod =
        validWavePeriods.length > 0
          ? validWavePeriods.reduce((a, b) => a + b, 0) /
            validWavePeriods.length
          : cached.hourly.wave_period_s[representativeIndex];
      const currentCloud =
        validClouds.length > 0
          ? validClouds.reduce((a, b) => a + b, 0) / validClouds.length
          : cached.hourly.cloud_pct[representativeIndex];
      const currentPressure =
        validPressures.length > 0
          ? validPressures.reduce((a, b) => a + b, 0) / validPressures.length
          : cached.hourly.pressure_hpa[representativeIndex];
      const currentTemp =
        validTemps.length > 0
          ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length
          : cached.hourly.temp_c[representativeIndex];

      // Get wind direction cardinal
      const windDirCardinal = degToCardinalGreek(currentWindDir);

      // Recalculate formatted values for selected day
      const formattedWind = formatWindSpeed(currentWindSpeed, windDirCardinal);
      const formattedWave = formatWave(currentWaveHeight, currentWavePeriod);
      const formattedTemp = formatTemperature(currentTemp);
      const formattedPressure = formatPressure(currentPressure);
      const formattedCloud = formatCloud(currentCloud);
      const formattedSeaTemp = formatTemperature(
        cached.current.wave.sea_temp_c
      ); // Sea temp doesn't change much hourly

      // Get daily rain data for selected day
      const dailyRain = cached.rain.daily[dayIndex] || cached.rain.daily[0];

      // Return modified forecast with updated current data for selected day
      return {
        ...cached,
        meta: {
          ...cached.meta,
          requestedDate: targetDate.toISOString().split("T")[0],
        },
        current: {
          air: {
            temp_c: currentTemp,
            pressure_hpa: currentPressure,
            cloud_pct: currentCloud,
          },
          wind: {
            speed_kn: currentWindSpeed,
            dir_deg: currentWindDir,
            dir_cardinal: windDirCardinal,
          },
          wave: {
            height_m: currentWaveHeight,
            period_s: currentWavePeriod,
            direction_deg: cached.current.wave.direction_deg, // Keep original
            swell_height_m: cached.current.wave.swell_height_m, // Keep original
            wind_wave_height_m: cached.current.wave.wind_wave_height_m, // Keep original
            sea_temp_c: cached.current.wave.sea_temp_c, // Sea temp doesn't change hourly
          },
          // Use weather condition from representative hour (first hour of the day)
          weather_condition:
            cached.hourly.weather_condition?.[representativeIndex] ??
            cached.current.weather_condition,
          weather_main:
            cached.hourly.weather_main?.[representativeIndex] ??
            cached.current.weather_main,
          weather_description:
            cached.hourly.weather_description?.[representativeIndex] ??
            cached.current.weather_description,
          weather_icon:
            cached.hourly.weather_icon?.[representativeIndex] ??
            cached.current.weather_icon,
          formatted: {
            wind: formattedWind,
            wave: formattedWave,
            air: {
              temp_display: formattedTemp.display,
              pressure_display: formattedPressure.display,
              cloud_display: formattedCloud.display,
            },
            water: {
              temp_display: formattedSeaTemp.display,
            },
          },
        },
        hourly: filteredHourly,
        rain: {
          ...cached.rain,
          today:
            dayIndex === 0
              ? cached.rain.today
              : {
                  willRain: dailyRain.willRain,
                  stopsAt: null, // Would need to calculate from hourly data
                  totalMm: dailyRain.totalMm,
                },
        },
      };
    },

    clearCache: (lat?: number, lon?: number) => {
      if (lat != null && lon != null) {
        const key = get().actions.getLocationKey(lat, lon);
        set((state) => {
          const newCache = { ...state.cache };
          delete newCache[key];
          return { cache: newCache };
        });
      } else {
        set({ cache: {} });
      }
    },

    setLoading: (loading: boolean) => set({ loading }),

    setError: (error: Error | null) => set({ error }),
  },
}));
