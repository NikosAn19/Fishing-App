import { MPS_TO_KNOTS, KNOTS_TO_BEAUFORT_THRESHOLDS } from "./conversions";

/** Convert knots to Beaufort scale (0-12) */
export function knotsToBeaufort(kn: number): number {
  if (kn < 1) return 0;
  for (let i = 0; i < KNOTS_TO_BEAUFORT_THRESHOLDS.length; i++) {
    const threshold = KNOTS_TO_BEAUFORT_THRESHOLDS[i];
    if (threshold != null && kn <= threshold) return i + 1;
  }
  return 12;
}

export type WindFormatted = {
  raw: number | null;
  knots: number | null;
  beaufort: number | null;
  display_kn: string;
  display_beaufort: string;
  display_full: string;
};

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

export type WaveFormatted = {
  raw_height: number | null;
  raw_period: number | null;
  display: string;
};

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

export type TempFormatted = {
  raw: number | null;
  display: string;
};

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

export type PressureFormatted = {
  raw: number | null;
  display: string;
};

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

export type CloudFormatted = {
  raw: number | null;
  display: string;
};

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

export type RainFormatted = {
  current: string;
  today: string;
  daily: string[];
};

/**
 * Format rain data for display
 */
export function formatRain(
  rainData: {
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
  },
  tz: string
): RainFormatted {
  // Format current status
  let currentStr = "Δεν βρέχει";
  if (rainData.current.isRaining) {
    if (rainData.current.intensity_mm != null) {
      currentStr = `Βρέχει: ${rainData.current.intensity_mm.toFixed(1)}mm/h`;
    } else if (rainData.current.description) {
      currentStr = `Βρέχει: ${rainData.current.description}`;
    } else {
      currentStr = "Βρέχει";
    }
  }

  // Format today's forecast
  let todayStr = "Δεν θα βρέξει σήμερα";
  if (rainData.today.willRain) {
    if (rainData.today.stopsAt) {
      try {
        const stopDate = new Date(rainData.today.stopsAt);
        const timeStr = new Intl.DateTimeFormat("el-GR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: tz,
        }).format(stopDate);
        todayStr = `Βροχή μέχρι ${timeStr}`;
      } catch {
        todayStr = "Βρέχει σήμερα";
      }
    } else {
      todayStr = "Βρέχει σήμερα";
    }
    if (rainData.today.totalMm != null) {
      todayStr += ` (${rainData.today.totalMm.toFixed(1)}mm)`;
    }
  }

  // Format daily forecasts
  const dailyStrs = rainData.daily.map((d) => {
    if (!d.willRain) {
      return "Δεν θα βρέξει";
    }
    let str = "Βροχή";
    if (d.totalMm != null) {
      str += ` ${d.totalMm.toFixed(1)}mm`;
    }
    if (d.pop > 0) {
      str += ` (${Math.round(d.pop * 100)}%)`;
    }
    if (d.description) {
      str += ` - ${d.description}`;
    }
    return str;
  });

  return {
    current: currentStr,
    today: todayStr,
    daily: dailyStrs,
  };
}
