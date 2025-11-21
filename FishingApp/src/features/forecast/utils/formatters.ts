/**
 * Frontend formatters matching backend logic
 * These are used to recalculate formatted values for day-specific forecasts
 */

/** Meters per second to knots conversion factor */
const MPS_TO_KNOTS = 1.943844;

/** Beaufort scale thresholds in knots */
const KNOTS_TO_BEAUFORT_THRESHOLDS = [
  1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63,
];

export type WindFormatted = {
  raw: number | null;
  knots: number | null;
  beaufort: number | null;
  display_kn: string;
  display_beaufort: string;
  display_full: string;
};

export type WaveFormatted = {
  raw_height: number | null;
  raw_period: number | null;
  display: string;
};

export type TempFormatted = {
  raw: number | null;
  display: string;
};

export type PressureFormatted = {
  raw: number | null;
  display: string;
};

export type CloudFormatted = {
  raw: number | null;
  display: string;
};

/** Convert knots to Beaufort scale (0-12) */
function knotsToBeaufort(kn: number | null): number {
  if (kn == null || kn < 1) return 0;
  for (let i = 0; i < KNOTS_TO_BEAUFORT_THRESHOLDS.length; i++) {
    const threshold = KNOTS_TO_BEAUFORT_THRESHOLDS[i];
    if (threshold != null && kn <= threshold) return i + 1;
  }
  return 12;
}

/** Format wind speed with direction */
export function formatWindSpeed(
  speedKn: number | null,
  dirCardinal: string | null
): WindFormatted {
  if (speedKn == null) {
    return {
      raw: null,
      knots: null,
      beaufort: null,
      display_kn: "—",
      display_beaufort: "—",
      display_full: dirCardinal || "—",
    };
  }

  const roundedKn = Math.round(speedKn);
  const beaufort = knotsToBeaufort(speedKn);
  const dir = dirCardinal ? `${dirCardinal} ` : "";

  return {
    raw: speedKn,
    knots: roundedKn,
    beaufort,
    display_kn: `${roundedKn} kn`,
    display_beaufort: `${beaufort} Μποφόρ`,
    display_full: `${dir}${roundedKn} kn (${beaufort} Μποφόρ)`,
  };
}

/** Format wave height and period */
export function formatWave(
  height_m: number | null,
  period_s: number | null
): WaveFormatted {
  if (height_m == null && period_s == null) {
    return {
      raw_height: null,
      raw_period: null,
      display: "—",
    };
  }

  const height = height_m != null ? height_m.toFixed(1) : "—";
  const period = period_s != null ? Math.round(period_s) : "—";

  return {
    raw_height: height_m,
    raw_period: period_s,
    display: `${height} m @ ${period} s`,
  };
}

/** Format temperature in Celsius */
export function formatTemperature(tempC: number | null): TempFormatted {
  if (tempC == null) {
    return {
      raw: null,
      display: "—",
    };
  }

  return {
    raw: tempC,
    display: `${tempC.toFixed(1)}°C`,
  };
}

/** Format pressure in hectopascals */
export function formatPressure(pressure_hpa: number | null): PressureFormatted {
  if (pressure_hpa == null) {
    return {
      raw: null,
      display: "—",
    };
  }

  return {
    raw: pressure_hpa,
    display: `${Math.round(pressure_hpa)} hPa`,
  };
}

/** Format cloud cover percentage */
export function formatCloud(cloud_pct: number | null): CloudFormatted {
  if (cloud_pct == null) {
    return {
      raw: null,
      display: "—",
    };
  }

  return {
    raw: cloud_pct,
    display: `${Math.round(cloud_pct)}%`,
  };
}

/** Convert degrees to Greek cardinal direction */
export function degToCardinalGreek(deg: number | null): string | null {
  if (deg == null || isNaN(deg)) return null;

  const directions = [
    "Β", // N - Βόρεια
    "ΒΒΑ", // NNE - Βορειοβορειοανατολικά
    "ΒΑ", // NE - Βορειοανατολικά
    "ΑΒΑ", // ENE - Ανατολοβορειοανατολικά
    "Α", // E - Ανατολικά
    "ΑΝΑ", // ESE - Ανατολονοτιοανατολικά
    "ΝΑ", // SE - Νοτιοανατολικά
    "ΝΝΑ", // SSE - Νοτιονοτιοανατολικά
    "Ν", // S - Νότια
    "ΝΝΔ", // SSW - Νοτιονοτιοδυτικά
    "ΝΔ", // SW - Νοτιοδυτικά
    "ΔΝΔ", // WSW - Δυτικονοτιοδυτικά
    "Δ", // W - Δυτικά
    "ΔΒΔ", // WNW - Δυτικοβορειοδυτικά
    "ΒΔ", // NW - Βορειοδυτικά
    "ΒΒΔ", // NNW - Βορειοβορειοδυτικά
  ];

  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || null;
}
