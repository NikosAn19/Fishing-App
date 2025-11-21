import React from "react";
import {
  Wind,
  Waves,
  Thermometer,
  Droplets,
  Cloud,
  Gauge,
} from "lucide-react-native";
import { colors } from "../../theme/colors";

/** Forecast metric identifiers */
export enum ForecastMetric {
  WIND = "wind",
  WAVES = "waves",
  AIR_TEMP = "air",
  WATER_TEMP = "water",
  CLOUDS = "clouds",
  PRESSURE = "pressure",
}

/** Forecast metric configuration with labels and icon components */
export const FORECAST_METRICS = {
  [ForecastMetric.WIND]: {
    label: "Άνεμος",
    icon: (size = 20) => (
      <Wind size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
  [ForecastMetric.WAVES]: {
    label: "Κύμα",
    icon: (size = 20) => (
      <Waves size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
  [ForecastMetric.AIR_TEMP]: {
    label: "Αέρας",
    icon: (size = 20) => (
      <Thermometer size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
  [ForecastMetric.WATER_TEMP]: {
    label: "Νερό",
    icon: (size = 20) => (
      <Droplets size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
  [ForecastMetric.CLOUDS]: {
    label: "Νέφη",
    icon: (size = 20) => (
      <Cloud size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
  [ForecastMetric.PRESSURE]: {
    label: "Πίεση",
    icon: (size = 20) => (
      <Gauge size={size} color={colors.white} strokeWidth={2.5} />
    ),
  },
} as const;
