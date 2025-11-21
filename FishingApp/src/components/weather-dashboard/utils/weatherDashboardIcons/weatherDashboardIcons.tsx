import React from "react";
import { View } from "react-native";
import {
  Sun,
  Moon,
  CloudRain,
  CloudLightning,
  Cloud,
  CloudDrizzle,
  CloudMoon,
  CloudMoonRain,
  Snowflake,
  CloudFog,
  CloudSun,
} from "lucide-react-native";
import { colors } from "../../../../theme/colors";

type WeatherIconKey =
  | "Sunny"
  | "Partly Cloudy"
  | "Cloudy"
  | "Rainy"
  | "Drizzle"
  | "Thunderstorm"
  | "Snow"
  | "Mist";

/**
 * Get main weather icon for large display
 * @param iconKey Weather condition key
 * @param size Icon size (default 64)
 * @param isDaytime Whether it's daytime (default true) - uses moon icons when false
 */
export function getMainIcon(
  iconKey: string,
  size = 64,
  isDaytime = true
): React.ReactElement {
  // Clear weather - use Sun during day, Moon at night
  if (iconKey === "Sunny") {
    if (isDaytime) {
      return <Sun size={size} color={colors.palette.amber[400]} />;
    } else {
      return <Moon size={size} color={colors.palette.slate[200]} />;
    }
  }

  // Partly cloudy - use CloudSun during day, CloudMoon at night
  if (iconKey === "Partly Cloudy") {
    if (isDaytime) {
      return (
        <CloudSun
          size={size}
          color={colors.palette.amber[400]}
          strokeWidth={2}
        />
      );
    } else {
      return (
        <CloudMoon
          size={size}
          color={colors.palette.slate[200]}
          strokeWidth={2}
        />
      );
    }
  }

  // Cloudy - same icon for day and night
  if (iconKey === "Cloudy") {
    return <Cloud size={size} color={colors.palette.slate[400]} />;
  }

  // Rainy - use CloudRain during day, CloudMoonRain at night
  if (iconKey === "Rainy") {
    if (isDaytime) {
      return <CloudRain size={size} color={colors.palette.blue[500]} />;
    } else {
      return <CloudMoonRain size={size} color={colors.palette.blue[500]} />;
    }
  }

  // Drizzle - same as Rainy
  if (iconKey === "Drizzle") {
    if (isDaytime) {
      return <CloudDrizzle size={size} color={colors.palette.blue[400]} />;
    } else {
      return <CloudMoonRain size={size} color={colors.palette.blue[400]} />;
    }
  }

  // Thunderstorm - same icon for day and night
  if (iconKey === "Thunderstorm") {
    return <CloudLightning size={size} color={colors.palette.purple[400]} />;
  }

  // Snow - same icon for day and night
  if (iconKey === "Snow") {
    return <Snowflake size={size} color={colors.palette.slate[200]} />;
  }

  // Mist - same icon for day and night
  if (iconKey === "Mist") {
    return <CloudFog size={size} color={colors.palette.slate[500]} />;
  }

  // Default fallback
  return <Cloud size={size} color={colors.palette.slate[400]} />;
}

/**
 * Get hourly weather icon for small display
 * @param cond Weather condition string
 * @param size Icon size (default 20)
 * @param isDaytime Whether it's daytime (default true) - uses moon icons when false
 */
export function getHourlyIcon(
  cond: string,
  size = 20,
  isDaytime = true
): React.ReactElement {
  // Clear weather - use Sun during day, Moon at night
  if (cond === "Sunny") {
    if (isDaytime) {
      return <Sun size={size} color={colors.palette.amber[400]} />;
    } else {
      return <Moon size={size} color={colors.palette.slate[200]} />;
    }
  }

  // Partly cloudy - use CloudSun during day, CloudMoon at night
  if (cond === "Partly Cloudy") {
    if (isDaytime) {
      return (
        <CloudSun
          size={size}
          color={colors.palette.amber[400]}
          strokeWidth={1.5}
        />
      );
    } else {
      return (
        <CloudMoon
          size={size}
          color={colors.palette.slate[200]}
          strokeWidth={1.5}
        />
      );
    }
  }

  // Cloudy - same icon for day and night
  if (cond === "Cloudy") {
    return <Cloud size={size} color={colors.palette.slate[400]} />;
  }

  // Rainy - use CloudRain during day, CloudMoonRain at night
  if (cond === "Rainy") {
    if (isDaytime) {
      return <CloudRain size={size} color={colors.palette.blue[500]} />;
    } else {
      return <CloudMoonRain size={size} color={colors.palette.blue[500]} />;
    }
  }

  // Drizzle - same as Rainy
  if (cond === "Drizzle") {
    if (isDaytime) {
      return <CloudDrizzle size={size} color={colors.palette.blue[400]} />;
    } else {
      return <CloudMoonRain size={size} color={colors.palette.blue[400]} />;
    }
  }

  // Thunderstorm - same icon for day and night
  if (cond === "Thunderstorm") {
    return <CloudLightning size={size} color={colors.palette.purple[400]} />;
  }

  // Snow - same icon for day and night
  if (cond === "Snow") {
    return <Snowflake size={size} color={colors.palette.slate[200]} />;
  }

  // Mist - same icon for day and night
  if (cond === "Mist") {
    return <CloudFog size={size} color={colors.palette.slate[500]} />;
  }

  // Default fallback
  return <Cloud size={size} color={colors.palette.slate[400]} />;
}
