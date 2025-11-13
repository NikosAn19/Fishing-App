import { fetchOpenMeteoWeather, fetchOpenMeteoMarine } from "./openMeteo";
import { fetchSunTimes } from "./sun";
import {
  fetchMoonFromOneCall,
  fetchWindFromOneCall,
  fetchSunFromOneCall,
} from "./openweather";
import { msToKnots, degToCardinalGreek } from "../utils/units";

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

export async function buildUnifiedForecast(
  lat: number,
  lon: number,
  tz: string,
  startDate?: string,
  endDate?: string
): Promise<UnifiedForecast> {
  const [w, m, sun, moon, wind, sunOW] = await Promise.all([
    fetchOpenMeteoWeather(lat, lon, tz, startDate, endDate),
    fetchOpenMeteoMarine(lat, lon, tz, startDate, endDate),
    fetchSunTimes(lat, lon, startDate),
    fetchMoonFromOneCall(lat, lon),
    fetchWindFromOneCall(lat, lon),
    fetchSunFromOneCall(lat, lon),
  ]);

  // pick current from OpenWeather wind data
  const wind_speed_kn = wind?.current?.speed_kn ?? null;
  const wind_dir_deg = wind?.current?.dir_deg ?? null;
  const wind_dir_cardinal = wind?.current?.dir_cardinal ?? null;
  const nowIndex = 0; // we could align by nearest hour; για MVP κρατάμε 0

  // hourly mapping with safe nulls
  const toKn = (arr?: number[]) =>
    arr?.map(msToKnots) ?? ([] as (number | null)[]);
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
    hourly: {
      time: wind?.hourly?.timeISO ?? w.hourly?.time ?? m.hourly?.time ?? [],
      wind_speed_kn: wind?.hourly?.wind_speed_kn ?? [],
      wind_dir_deg: wind?.hourly?.wind_dir_deg ?? [],
      wave_height_m: m.hourly?.wave_height ?? [],
      wave_period_s: m.hourly?.wave_period ?? [],
      cloud_pct: w.hourly?.cloud_cover ?? [],
      pressure_hpa: w.hourly?.pressure_msl ?? [],
      temp_c: w.hourly?.temperature_2m ?? [],
    },
  };

  return unify;
}
