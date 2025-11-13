const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const MARINE_BASE = "https://marine-api.open-meteo.com/v1/marine";

type OMHourly<T extends string> = {
  hourly: { time: string[] } & Record<T, number[]>;
};

export async function fetchOpenMeteoWeather(
  lat: number,
  lon: number,
  tz: string,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "pressure_msl",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    current_weather: "true",
    timezone: tz,
  });

  // Add date range if provided
  if (startDate) {
    params.append("start_date", startDate);
  }
  if (endDate) {
    params.append("end_date", endDate);
  }
  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`OpenMeteo weather HTTP ${res.status}`);
  return res.json() as Promise<
    OMHourly<
      | "temperature_2m"
      | "pressure_msl"
      | "cloud_cover"
      | "wind_speed_10m"
      | "wind_direction_10m"
    > & { current_weather: any }
  >;
}

export async function fetchOpenMeteoMarine(
  lat: number,
  lon: number,
  tz: string,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "wave_height",
      "wave_direction",
      "wave_period",
      "swell_wave_height",
      "swell_wave_direction",
      "swell_wave_period",
      "wind_wave_height",
      "wind_wave_direction",
      "wind_wave_period",
      "sea_surface_temperature",
    ].join(","),
    timezone: tz,
  });

  // Add date range if provided
  if (startDate) {
    params.append("start_date", startDate);
  }
  if (endDate) {
    params.append("end_date", endDate);
  }
  const res = await fetch(`${MARINE_BASE}?${params}`);
  if (!res.ok) throw new Error(`OpenMeteo marine HTTP ${res.status}`);
  return res.json() as Promise<
    OMHourly<
      | "wave_height"
      | "wave_direction"
      | "wave_period"
      | "swell_wave_height"
      | "swell_wave_direction"
      | "swell_wave_period"
      | "wind_wave_height"
      | "wind_wave_direction"
      | "wind_wave_period"
      | "sea_surface_temperature"
    >
  >;
}
