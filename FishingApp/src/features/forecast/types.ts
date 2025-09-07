export type BestWindow = { label: string; icon: keyof typeof IoniconsNames };
export type DriverVerdict = "good" | "ok" | "warn";

export type Driver = {
  icon: string;
  title: string;
  value: string;
  verdict: DriverVerdict;
  note?: string;
};

export type Recommendation = {
  icon: keyof typeof IoniconsNames;
  title: string;
  lines: string[];
};

export type BreakdownItem = {
  key: string;
  weight: number; // 0..1
  score: number; // 0..1
  color: string;
};

export type AlertLevel = "amber" | "red";
export type ForecastAlert = { level: AlertLevel; text: string };

export type StatusTone = "great" | "ok" | "bad";
export type StatusInfo = { label: string; tone: StatusTone };

export function getStatus(score: number): StatusInfo {
  if (score >= 70) return { label: "Εξαιρετική", tone: "great" };
  if (score >= 40) return { label: "Καλή", tone: "ok" };
  return { label: "Δύσκολη", tone: "bad" };
}

export function pct(num: number) {
  return Math.max(0, Math.min(100, Math.round(num)));
}

/** Helper so TS knows Ionicons names without importing the lib here. */
export const IoniconsNames = {
  "sunny-outline": true,
  "moon-outline": true,
  "location-outline": true,
  "sparkles-outline": true,
  "thumbs-up-outline": true,
  "alert-circle-outline": true,
  "contrast-outline": true,
  "swap-vertical-outline": true,
  "leaf-outline": true,
  "water-outline": true,
  "thermometer-outline": true,
  "cloud-outline": true,
  "compass-outline": true,
  "trending-up-outline": true,
  "warning-outline": true,
  "alert-outline": true,
  "fish-outline": true,
  "flame-outline": true,
  "map-outline": true,
  "camera-outline": true,
  "navigate-outline": true,
  "airplane-outline": true,
  "wave-outline": true,
  "speedometer-outline": true,
  "flag-outline": true,
  "pulse-outline": true,
  "layers-outline": true,
} as const;
