import { UnifiedForecast } from "../api/types";

type NullableNumber = number | null | undefined;

export const FORECAST_WEIGHTS = {
  wind: 0.2,
  waves: 0.2,
  clouds: 0.1,
  airTemp: 0.15,
  waterTemp: 0.15,
  pressure: 0.1,
  constant: 0.1,
} as const;

export const BEST_TIME_THRESHOLD = 70;

export function scaleGood(
  val?: NullableNumber,
  [best, mid, max] = [0, 12, 25]
) {
  if (val == null) return 0.5;
  if (val <= best) return 1;
  if (val >= max) return 0;
  if (val <= mid) return 0.8;
  return 0.5;
}

export function scaleInverse(
  val?: NullableNumber,
  [low, mid, high] = [0.2, 0.8, 1.4]
) {
  if (val == null) return 0.5;
  if (val <= low) return 1;
  if (val >= high) return 0;
  if (val <= mid) return 0.7;
  return 0.4;
}

export function scaleClouds(val?: NullableNumber) {
  if (val == null) return 0.5;
  const pct = val / 100;
  const distFrom30 = Math.abs(pct - 0.3);
  return Math.max(0, 1 - distFrom30 * 1.2);
}

export function scaleTemperature(
  val?: NullableNumber,
  [idealMin, idealMax] = [15, 25]
) {
  if (val == null) return 0.5;
  if (val >= idealMin && val <= idealMax) return 1;
  const distance = val < idealMin ? idealMin - val : val - idealMax;
  return Math.max(0, 1 - distance * 0.1);
}

export function scalePressure(
  val?: NullableNumber,
  goodThreshold = 1020,
  maxThreshold = 1030
) {
  if (val == null) return 0.5;
  if (val <= goodThreshold) return 1;
  if (val >= maxThreshold) return 0;
  return 1 - (val - goodThreshold) / (maxThreshold - goodThreshold);
}

export function computeCompositeScore(
  current: UnifiedForecast["current"],
  weights = FORECAST_WEIGHTS
) {
  const windScore = scaleGood(current.wind.speed_kn);
  const waveScore = scaleInverse(current.wave.height_m);
  const cloudScore = scaleClouds(current.air.cloud_pct);
  const airTempScore = scaleTemperature(current.air.temp_c);
  const waterTempScore = scaleTemperature(current.wave.sea_temp_c);
  const pressureScore = scalePressure(current.air.pressure_hpa);
  const total =
    windScore * weights.wind +
    waveScore * weights.waves +
    cloudScore * weights.clouds +
    airTempScore * weights.airTemp +
    waterTempScore * weights.waterTemp +
    pressureScore * weights.pressure +
    weights.constant * weights.constant;
  return Math.round(total * 100);
}

export function computeForecastScore(f: Pick<UnifiedForecast, "current">) {
  return computeCompositeScore(f.current);
}

export type BestTimeSlot = {
  isoTime: string;
  score: number;
};

export function extractBestTimeSlots(
  hourly: UnifiedForecast["hourly"] | undefined,
  threshold = BEST_TIME_THRESHOLD,
  limit = 3
): BestTimeSlot[] {
  if (!hourly) return [];

  const slots: BestTimeSlot[] = [];

  for (let i = 0; i < Math.min(hourly.time.length, 24); i++) {
    const windSpeed = hourly.wind_speed_kn?.[i] ?? null;
    const waveHeight = hourly.wave_height_m?.[i] ?? null;
    const cloudCover = hourly.cloud_pct?.[i] ?? null;

    const windScore = scaleGood(windSpeed);
    const waveScore = scaleInverse(waveHeight);
    const cloudScore = scaleClouds(cloudCover);
    const totalScore =
      windScore * FORECAST_WEIGHTS.wind +
      waveScore * FORECAST_WEIGHTS.waves +
      cloudScore * FORECAST_WEIGHTS.clouds +
      FORECAST_WEIGHTS.constant * FORECAST_WEIGHTS.constant;

    const score = Math.round(totalScore * 100);
    if (score >= threshold) {
      slots.push({
        isoTime: hourly.time[i],
        score,
      });
    }
  }

  return slots.sort((a, b) => b.score - a.score).slice(0, limit);
}
