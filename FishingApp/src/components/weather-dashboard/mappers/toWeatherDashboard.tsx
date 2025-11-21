import React from "react";
import { View, Text } from "react-native";
import { Navigation, ArrowUp } from "lucide-react-native";
import {
  UnifiedForecast,
  WeatherCondition,
} from "../../../features/forecast/api/types";
import { computeForecastScore } from "../../../features/forecast/utils/forecastMetrics";
import { DEFAULT_TIMEZONE } from "../../../config/time";
import { colors } from "../../../theme/colors";
import {
  calculateBeaufort,
  calculateWindStatus,
  calculateSeaTempStatus,
  calculatePressureTrend,
  getWeatherCondition,
} from "../utils/weatherCalculations/weatherCalculations";
import {
  formatTimeISO,
  getDaySelectorDays,
} from "../utils/timeFormatters/timeFormatters";
import { safeText, safeTextOrNull } from "../utils/textUtils/textUtils";
import {
  Wind,
  Moon,
  Gauge,
  Thermometer,
  ArrowUp as ArrowUpIcon,
} from "lucide-react-native";
import { getWeatherConditionInGreek } from "../utils/weatherTranslations/weatherTranslations";
import {
  LocationHeaderData,
  DaySelectorData,
  MainCardData,
  HourlyForecastData,
  StatsGridData,
  SunriseSunsetData,
} from "./types";

/**
 * Map location header data
 */
export function mapLocationHeader(
  forecast: UnifiedForecast,
  locationText: string
): LocationHeaderData {
  return {
    locationLabel: "ΤΡΕΧΟΥΣΑ ΤΟΠΟΘΕΣΙΑ",
    locationText: safeText(locationText),
  };
}

/**
 * Map day selector data
 */
export function mapDaySelector(forecast: UnifiedForecast): DaySelectorData {
  return getDaySelectorDays(forecast);
}

/**
 * Map WeatherCondition enum to icon key string
 * @param condition WeatherCondition enum value
 * @param isDaytime Whether it's daytime (default true) - reserved for future day/night variations
 * @returns Icon key string for the icon mapping functions
 */
export function mapWeatherConditionToIconKey(
  condition: WeatherCondition,
  isDaytime = true
): MainCardData["iconKey"] {
  switch (condition) {
    case WeatherCondition.CLEAR:
      return "Sunny";
    case WeatherCondition.PARTLY_CLOUDY:
      return "Partly Cloudy";
    case WeatherCondition.CLOUDY:
      return "Cloudy";
    case WeatherCondition.RAINY:
      return "Rainy";
    case WeatherCondition.DRIZZLE:
      return "Drizzle";
    case WeatherCondition.THUNDERSTORM:
      return "Thunderstorm";
    case WeatherCondition.SNOW:
      return "Snow";
    case WeatherCondition.MIST:
      return "Mist";
    default:
      return "Cloudy";
  }
}

/**
 * Determine if a given time is daytime based on sunrise/sunset
 */
function isDaytime(
  timeISO: string,
  sunrise: string,
  sunset: string,
  tz: string
): boolean {
  try {
    const time = new Date(timeISO);
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    return time >= sunriseTime && time < sunsetTime;
  } catch {
    // Default to daytime if parsing fails
    return true;
  }
}

/**
 * Map main card data
 */
export function mapMainCard(forecast: UnifiedForecast): MainCardData {
  // Use weather condition from API instead of calculating from cloud_pct
  const weatherCondition =
    forecast.current.weather_condition ?? WeatherCondition.CLOUDY;

  // Determine if current time is daytime
  // Use weather_icon suffix ("d" = day, "n" = night) as primary indicator
  const iconCode = forecast.current.weather_icon;
  const isDay = iconCode?.endsWith("d") ?? true; // Default to day if unknown

  const iconKey = mapWeatherConditionToIconKey(weatherCondition, isDay);

  // Always use Greek translation for condition name
  const conditionText = getWeatherConditionInGreek(iconKey);

  const temp = forecast.current.air.temp_c ?? 0;
  const hourlyTemps = forecast.hourly.temp_c.filter(
    (t): t is number => t != null
  );
  const high = hourlyTemps.length > 0 ? Math.max(...hourlyTemps) : temp;
  const low = hourlyTemps.length > 0 ? Math.min(...hourlyTemps) : temp;
  const score = computeForecastScore(forecast);

  // Calculate status items
  const windStatus = calculateWindStatus(forecast.current.wind.speed_kn);
  const seaTempStatus = calculateSeaTempStatus(
    forecast.current.wave.sea_temp_c
  );
  const seaTemp = forecast.current.wave.sea_temp_c ?? 0;

  const statusItems: MainCardData["statusItems"] = [
    {
      icon: ArrowUpIcon,
      text: "Ενεργό",
      isActive: score >= 70,
      iconColor: colors.palette.emerald[400],
    },
    {
      icon: Wind,
      text: safeText(windStatus.description),
      isActive: false,
    },
    {
      icon: Thermometer,
      text: `Νερό ${seaTemp.toFixed(1)}°`,
      isActive: false,
    },
  ];

  return {
    condition: safeText(conditionText),
    iconKey,
    isDaytime: isDay,
    temp: isNaN(Math.round(temp)) ? 0 : Math.round(temp),
    high: isNaN(Math.round(high)) ? 0 : Math.round(high),
    low: isNaN(Math.round(low)) ? 0 : Math.round(low),
    score: isNaN(score) ? 0 : score,
    statusItems,
  };
}

/**
 * Map hourly forecast data
 */
export function mapHourlyForecast(
  forecast: UnifiedForecast,
  selectedDate?: string
): HourlyForecastData {
  const hourly: HourlyForecastData = [];
  const tz = forecast.meta?.tz || DEFAULT_TIMEZONE;

  // Filter hourly data for selected date if provided
  let timeIndices = forecast.hourly.time.map((_, i) => i);
  if (selectedDate) {
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    timeIndices = forecast.hourly.time
      .map((time, i) => {
        const timeDate = new Date(time);
        return timeDate >= selectedDateObj && timeDate < nextDay ? i : null;
      })
      .filter((i): i is number => i != null);
  } else {
    // Default to next 24 hours
    timeIndices = timeIndices.slice(0, 24);
  }

  // Get sunrise/sunset for day/night determination
  const sunrise = forecast.sun.sunrise;
  const sunset = forecast.sun.sunset;

  for (const i of timeIndices) {
    const time = safeText(formatTimeISO(forecast.hourly.time[i], tz));
    const temp = forecast.hourly.temp_c[i] ?? 0;

    // Use weather condition from API instead of calculating from cloud_pct
    const condition =
      forecast.hourly.weather_condition[i] ?? WeatherCondition.CLOUDY;

    // Determine if this hour is daytime
    // Use weather_icon suffix ("d" = day, "n" = night) as primary indicator
    const iconCode = forecast.hourly.weather_icon[i];
    const isDay = iconCode?.endsWith("d") ?? true; // Default to day if unknown

    // Map condition enum to icon key string
    const weather = mapWeatherConditionToIconKey(
      condition,
      isDay
    ) as HourlyForecastData[number]["weather"];

    hourly.push({
      time,
      temp: isNaN(Math.round(temp)) ? 0 : Math.round(temp),
      weather,
      isDaytime: isDay,
    });
  }

  return hourly;
}

/**
 * Map stats grid data
 */
export function mapStatsGrid(forecast: UnifiedForecast): StatsGridData {
  const beaufort = calculateBeaufort(forecast.current.wind.speed_kn);
  const windStatus = calculateWindStatus(forecast.current.wind.speed_kn);
  const seaTempStatus = calculateSeaTempStatus(
    forecast.current.wave.sea_temp_c
  );

  // Calculate pressure trend (compare current with previous hour)
  const currentPressure = forecast.current.air.pressure_hpa;
  const previousPressure =
    forecast.hourly.pressure_hpa.length > 1
      ? forecast.hourly.pressure_hpa[1]
      : currentPressure;
  const pressureTrend = calculatePressureTrend(
    currentPressure,
    previousPressure
  );

  const stats: StatsGridData = [
    {
      icon: Wind,
      iconColor: colors.palette.blue[400],
      iconBgColor: colors.palette.blue[500] + "1A",
      label: "Άνεμος",
      value: `${isNaN(beaufort.force ?? 0) ? 0 : beaufort.force ?? 0} Μποφόρ`,
      subText: (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
        >
          <Navigation
            size={8}
            color={colors.palette.blue[400]}
            style={{
              transform: [
                { rotate: `${forecast.current.wind.dir_deg ?? 0}deg` },
              ],
            }}
          />
          <Text
            style={{
              fontSize: 10,
              color: colors.palette.slate[400],
              marginLeft: 4,
            }}
          >
            {safeText(forecast.current.wind.dir_cardinal)} •{" "}
            {safeText(beaufort.description)}
          </Text>
        </View>
      ),
    },
    {
      icon: Moon,
      iconColor: colors.palette.purple[400],
      iconBgColor: colors.palette.purple[400] + "1A",
      label: "Σελήνη",
      value: safeText(forecast.moon.label),
      subText: (
        <Text
          style={{
            fontSize: 10,
            color: colors.palette.emerald[400],
            fontWeight: "500",
            marginTop: 4,
          }}
        >
          {Math.round((forecast.moon.fraction ?? 0) * 100)}% Φωτειν.
        </Text>
      ),
      valueStyle: "moon" as const,
    },
    {
      icon: Gauge,
      iconColor: colors.palette.teal[400],
      iconBgColor: colors.palette.teal[400] + "1A",
      label: "Πίεση",
      value: safeText(forecast.current.formatted.air.pressure_display),
      subText: (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
        >
          <ArrowUpIcon
            size={10}
            color={
              pressureTrend.trend === "RISING"
                ? colors.palette.emerald[400]
                : pressureTrend.trend === "FALLING"
                ? colors.palette.amber[400]
                : colors.palette.slate[400]
            }
            style={{
              transform: [
                {
                  rotate: pressureTrend.trend === "FALLING" ? "180deg" : "0deg",
                },
              ],
            }}
          />
          <Text
            style={{
              fontSize: 10,
              color:
                pressureTrend.trend === "RISING"
                  ? colors.palette.emerald[400]
                  : pressureTrend.trend === "FALLING"
                  ? colors.palette.amber[400]
                  : colors.palette.slate[400],
              marginLeft: 4,
            }}
          >
            {safeText(pressureTrend.description)}
          </Text>
        </View>
      ),
    },
    {
      icon: Thermometer,
      iconColor: colors.palette.indigo[400],
      iconBgColor: colors.palette.indigo[400] + "1A",
      label: "Θερμ. Θάλασσας",
      value: safeText(forecast.current.formatted.water.temp_display),
      subText: safeTextOrNull(seaTempStatus.description),
      valueStyle: "sea" as const,
    },
  ];

  return stats;
}

/**
 * Map sunrise/sunset data
 */
export function mapSunriseSunset(forecast: UnifiedForecast): SunriseSunsetData {
  const tz = forecast.meta?.tz || DEFAULT_TIMEZONE;
  return {
    sunrise: safeText(formatTimeISO(forecast.sun.sunrise, tz)),
    sunset: safeText(formatTimeISO(forecast.sun.sunset, tz)),
  };
}
