import {
  BeaufortForce,
  BEAUFORT_DESCRIPTIONS,
  KNOTS_TO_BEAUFORT_THRESHOLDS,
  WindStatus,
  WIND_STATUS_DESCRIPTIONS,
  SeaTempStatus,
  SEA_TEMP_DESCRIPTIONS,
  PressureTrend,
  PRESSURE_TREND_DESCRIPTIONS,
} from "../../constants/weatherDescriptions";
import { UnifiedForecast } from "../../../../features/forecast/api/types";
import {
  BeaufortResult,
  WindStatusResult,
  SeaTempStatusResult,
  PressureTrendResult,
  WeatherConditionResult,
} from "./types";

/**
 * Calculate Beaufort force from wind speed in knots
 * Uses the same thresholds as the backend (Server/src/utils/formatters.ts)
 */
export function calculateBeaufort(knots: number | null): BeaufortResult {
  if (knots == null || knots < 1) {
    return {
      force: BeaufortForce.CALM,
      description: BEAUFORT_DESCRIPTIONS[BeaufortForce.CALM] || "—",
    };
  }

  for (let i = 0; i < KNOTS_TO_BEAUFORT_THRESHOLDS.length; i++) {
    const threshold = KNOTS_TO_BEAUFORT_THRESHOLDS[i];
    if (threshold != null && knots <= threshold) {
      const force = (i + 1) as BeaufortForce;
      return {
        force,
        description: BEAUFORT_DESCRIPTIONS[force] || "—",
      };
    }
  }

  return {
    force: BeaufortForce.HURRICANE,
    description: BEAUFORT_DESCRIPTIONS[BeaufortForce.HURRICANE] || "—",
  };
}

/**
 * Calculate wind status from wind speed in knots
 */
export function calculateWindStatus(knots: number | null): WindStatusResult {
  if (knots == null || knots < 5) {
    return {
      status: WindStatus.CALM,
      description: WIND_STATUS_DESCRIPTIONS[WindStatus.CALM] || "—",
    };
  }
  if (knots < 12) {
    return {
      status: WindStatus.LIGHT,
      description: WIND_STATUS_DESCRIPTIONS[WindStatus.LIGHT] || "—",
    };
  }
  if (knots < 25) {
    return {
      status: WindStatus.MODERATE,
      description: WIND_STATUS_DESCRIPTIONS[WindStatus.MODERATE] || "—",
    };
  }
  return {
    status: WindStatus.STRONG,
    description: WIND_STATUS_DESCRIPTIONS[WindStatus.STRONG] || "—",
  };
}

/**
 * Calculate sea temperature status
 * Ideal range for fishing (especially sea bass): 15-25°C
 */
export function calculateSeaTempStatus(
  tempC: number | null
): SeaTempStatusResult {
  if (tempC == null) {
    return {
      status: SeaTempStatus.IDEAL,
      description: SEA_TEMP_DESCRIPTIONS[SeaTempStatus.IDEAL] || "—",
    };
  }
  if (tempC < 15) {
    return {
      status: SeaTempStatus.COLD,
      description: SEA_TEMP_DESCRIPTIONS[SeaTempStatus.COLD] || "—",
    };
  }
  if (tempC >= 15 && tempC <= 25) {
    return {
      status: SeaTempStatus.IDEAL,
      description: SEA_TEMP_DESCRIPTIONS[SeaTempStatus.IDEAL] || "—",
    };
  }
  return {
    status: SeaTempStatus.WARM,
    description: SEA_TEMP_DESCRIPTIONS[SeaTempStatus.WARM] || "—",
  };
}

/**
 * Calculate pressure trend from current and previous pressure values
 * Returns "Ανοδική" if diff > 2, "Καθοδική" if diff < -2, "Σταθερή" otherwise
 */
export function calculatePressureTrend(
  current: number | null,
  previous: number | null
): PressureTrendResult {
  if (current == null || previous == null) {
    return {
      trend: PressureTrend.STABLE,
      description: PRESSURE_TREND_DESCRIPTIONS[PressureTrend.STABLE] || "—",
    };
  }
  const diff = current - previous;
  if (diff > 2) {
    return {
      trend: PressureTrend.RISING,
      description: PRESSURE_TREND_DESCRIPTIONS[PressureTrend.RISING] || "—",
    };
  }
  if (diff < -2) {
    return {
      trend: PressureTrend.FALLING,
      description: PRESSURE_TREND_DESCRIPTIONS[PressureTrend.FALLING] || "—",
    };
  }
  return {
    trend: PressureTrend.STABLE,
    description: PRESSURE_TREND_DESCRIPTIONS[PressureTrend.STABLE] || "—",
  };
}

/**
 * Determine weather condition and icon key from rain and cloud data
 */
export function getWeatherCondition(
  rain: UnifiedForecast["rain"],
  cloudPct: number | null
): WeatherConditionResult {
  // Check if it's currently raining or will rain
  if (rain?.current?.isRaining || rain?.today?.willRain) {
    // Check for storm conditions (high intensity or thunderstorm)
    const intensity = rain.current?.intensity_mm ?? 0;
    if (intensity > 10) {
      return {
        condition: "Καταιγίδα",
        iconKey: "Thunderstorm",
      };
    }
    return {
      condition: "Βροχερός",
      iconKey: "Rainy",
    };
  }

  // Check cloud cover
  if (cloudPct == null || cloudPct < 30) {
    return {
      condition: "Ηλιόλουστος",
      iconKey: "Sunny",
    };
  }
  if (cloudPct < 70) {
    return {
      condition: "Αραιή Συννεφιά",
      iconKey: "Partly Cloudy",
    };
  }
  return {
    condition: "Συννεφιασμένος",
    iconKey: "Cloudy",
  };
}
