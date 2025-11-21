import {
  BeaufortForce,
  WindStatus,
  SeaTempStatus,
  PressureTrend,
} from "../../constants/weatherDescriptions";

/** Result type for calculateBeaufort function */
export type BeaufortResult = {
  force: BeaufortForce;
  description: string;
};

/** Result type for calculateWindStatus function */
export type WindStatusResult = {
  status: WindStatus;
  description: string;
};

/** Result type for calculateSeaTempStatus function */
export type SeaTempStatusResult = {
  status: SeaTempStatus;
  description: string;
};

/** Result type for calculatePressureTrend function */
export type PressureTrendResult = {
  trend: PressureTrend;
  description: string;
};

/** Result type for getWeatherCondition function */
export type WeatherConditionResult = {
  condition: string;
  iconKey:
    | "Sunny"
    | "Partly Cloudy"
    | "Cloudy"
    | "Rainy"
    | "Drizzle"
    | "Thunderstorm"
    | "Snow"
    | "Mist";
};
