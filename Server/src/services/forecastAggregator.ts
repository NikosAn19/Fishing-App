import { fetchOpenMeteoWeather, fetchOpenMeteoMarine } from "./openMeteo";
import { fetchSunTimes } from "./sun";
import {
  fetchOneCallData,
  extractWindData,
  extractMoonData,
  extractSunData,
  extractRainData,
  extractWeatherConditions,
} from "./openweather";
import { WeatherCondition } from "../types/weather";
import { degToCardinalGreek } from "../utils/units";
import {
  formatWindSpeed,
  formatWave,
  formatTemperature,
  formatPressure,
  formatCloud,
  formatRain,
  type WindFormatted,
  type WaveFormatted,
  type TempFormatted,
  type PressureFormatted,
  type CloudFormatted,
  type RainFormatted,
} from "../utils/formatters";

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
    weather_condition: WeatherCondition;
    weather_main: string | null;
    weather_description: string | null;
    weather_icon: string | null;
    formatted: {
      wind: WindFormatted;
      wave: WaveFormatted;
      air: {
        temp_display: string;
        pressure_display: string;
        cloud_display: string;
      };
      water: {
        temp_display: string;
      };
    };
  };
  sun: { sunrise: string; sunset: string; day_length_sec: number };
  moon: { fraction: number; label: string };
  rain: {
    current: {
      isRaining: boolean;
      intensity_mm: number | null;
      description: string | null;
    };
    today: {
      willRain: boolean;
      stopsAt: string | null;
      totalMm: number | null;
    };
    daily: Array<{
      date: string;
      willRain: boolean;
      totalMm: number | null;
      pop: number;
      description: string | null;
    }>;
    formatted: RainFormatted;
  };
  hourly: {
    time: string[];
    wind_speed_kn: (number | null)[];
    wind_dir_deg: (number | null)[];
    wave_height_m: (number | null)[];
    wave_period_s: (number | null)[];
    cloud_pct: (number | null)[];
    pressure_hpa: (number | null)[];
    temp_c: (number | null)[];
    weather_condition: WeatherCondition[];
    weather_main: (string | null)[];
    weather_description: (string | null)[];
    weather_icon: (string | null)[];
  };
};

export async function buildUnifiedForecast(
  lat: number,
  lon: number,
  tz: string,
  startDate?: string,
  endDate?: string
): Promise<UnifiedForecast> {
  // Make single One Call API request and extract all data
  const [w, m, sun, oneCallResponse] = await Promise.all([
    fetchOpenMeteoWeather(lat, lon, tz, startDate, endDate),
    fetchOpenMeteoMarine(lat, lon, tz, startDate, endDate),
    fetchSunTimes(lat, lon, startDate),
    fetchOneCallData(lat, lon),
  ]);

  // Extract wind, moon, sun, rain, and weather conditions from single One Call response
  const wind = extractWindData(oneCallResponse);
  const moon = extractMoonData(oneCallResponse);
  const sunOW = extractSunData(oneCallResponse);
  const rainData = extractRainData(oneCallResponse, tz);
  const rainFormatted = formatRain(rainData, tz);
  const weatherConditions = extractWeatherConditions(oneCallResponse);

  // pick current from OpenWeather wind data
  const wind_speed_kn = wind?.current?.speed_kn ?? null;
  const wind_dir_deg = wind?.current?.dir_deg ?? null;
  const wind_dir_cardinal = wind?.current?.dir_cardinal ?? null;
  const nowIndex = 0; // we could align by nearest hour; για MVP κρατάμε 0

  const unify: UnifiedForecast = {
    meta: { lat, lon, tz, generatedAt: new Date().toISOString() },
    current: {
      air: {
        temp_c: w.current_weather?.temperature ?? null,
        pressure_hpa: w.hourly?.pressure_msl?.[nowIndex] ?? null,
        cloud_pct: w.hourly?.cloud_cover?.[nowIndex] ?? null,
      },
      wind: {
        speed_kn: wind_speed_kn,
        dir_deg: wind_dir_deg,
        dir_cardinal: wind_dir_cardinal,
      },
      wave: {
        height_m: m.hourly?.wave_height?.[nowIndex] ?? null,
        period_s: m.hourly?.wave_period?.[nowIndex] ?? null,
        direction_deg: m.hourly?.wave_direction?.[nowIndex] ?? null,
        swell_height_m: m.hourly?.swell_wave_height?.[nowIndex] ?? null,
        wind_wave_height_m: m.hourly?.wind_wave_height?.[nowIndex] ?? null,
        sea_temp_c: m.hourly?.sea_surface_temperature?.[nowIndex] ?? null,
      },
      weather_condition: weatherConditions.current.condition,
      weather_main: weatherConditions.current.main,
      weather_description: weatherConditions.current.description,
      weather_icon: weatherConditions.current.icon,
      formatted: {
        wind: formatWindSpeed(wind_speed_kn, wind_dir_cardinal),
        wave: formatWave(
          m.hourly?.wave_height?.[nowIndex] ?? null,
          m.hourly?.wave_period?.[nowIndex] ?? null
        ),
        air: {
          temp_display: formatTemperature(
            w.current_weather?.temperature ?? null
          ).display,
          pressure_display: formatPressure(
            w.hourly?.pressure_msl?.[nowIndex] ?? null
          ).display,
          cloud_display: formatCloud(w.hourly?.cloud_cover?.[nowIndex] ?? null)
            .display,
        },
        water: {
          temp_display: formatTemperature(
            m.hourly?.sea_surface_temperature?.[nowIndex] ?? null
          ).display,
        },
      },
    },
    sun: {
      sunrise: sunOW?.sunriseISO ?? sun.sunrise,
      sunset: sunOW?.sunsetISO ?? sun.sunset,
      day_length_sec: sunOW?.day_length_sec ?? sun.day_length,
    },
    moon: {
      fraction: moon.fraction,
      label: moon.label,
    },
    rain: {
      ...rainData,
      formatted: rainFormatted,
    },
    hourly: {
      time: wind?.hourly?.timeISO ?? w.hourly?.time ?? m.hourly?.time ?? [],
      wind_speed_kn: wind?.hourly?.wind_speed_kn ?? [],
      wind_dir_deg: wind?.hourly?.wind_dir_deg ?? [],
      wave_height_m: m.hourly?.wave_height ?? [],
      wave_period_s: m.hourly?.wave_period ?? [],
      cloud_pct: w.hourly?.cloud_cover ?? [],
      pressure_hpa: w.hourly?.pressure_msl ?? [],
      temp_c: w.hourly?.temperature_2m ?? [],
      weather_condition: weatherConditions.hourly.condition,
      weather_main: weatherConditions.hourly.main,
      weather_description: weatherConditions.hourly.description,
      weather_icon: weatherConditions.hourly.icon,
    },
  };

  return unify;
}
