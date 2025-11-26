/**
 * Standardized weather condition enum for our application
 * Maps OpenWeather codes to our app's weather conditions
 */
export enum WeatherCondition {
  CLEAR = "CLEAR", // 800 - Clear sky
  PARTLY_CLOUDY = "PARTLY_CLOUDY", // 801, 802, 803 - Few/Scattered/Broken clouds
  CLOUDY = "CLOUDY", // 804 - Overcast clouds
  RAINY = "RAINY", // 5xx - Rain
  DRIZZLE = "DRIZZLE", // 3xx - Drizzle
  THUNDERSTORM = "THUNDERSTORM", // 2xx - Thunderstorm
  SNOW = "SNOW", // 6xx - Snow
  MIST = "MIST", // 7xx - Mist/Fog/Haze
}

export type UnifiedForecast = {
  meta: {
    lat: number;
    lon: number;
    tz: string;
    generatedAt: string;
    requestedDate?: string;
    dateRange?: { startDate: string; endDate: string };
  };
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
      wind: {
        raw: number | null;
        knots: number | null;
        beaufort: number | null;
        display_kn: string;
        display_beaufort: string;
        display_full: string;
      };
      wave: {
        raw_height: number | null;
        raw_period: number | null;
        display: string;
      };
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
    formatted: {
      current: string;
      today: string;
      daily: string[];
    };
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

export type GetForecastOpts = {
  /** Παράκαμψε το server cache layer; default: true (δεν στέλνεται) */
  cache?: boolean;
  /** Custom AbortSignal αν το διαχειρίζεσαι απ' έξω */
  signal?: AbortSignal;
  /** Timeout σε ms (default 12s) */
  timeoutMs?: number;
};
