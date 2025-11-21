/**
 * Standardized weather condition enum for our application
 * Maps OpenWeather codes to our app's weather conditions
 */
export enum WeatherCondition {
  CLEAR = "CLEAR", // 800 - Clear sky
  PARTLY_CLOUDY = "PARTLY_CLOUDY", // 801, 802, 803 - Few/Scattered/Broken clouds
  CLOUDY = "CLOUDY", // 804 - Overcast clouds
  RAINY = "RAINY", // 5xx - Rain
  DRIZZLE = "DRIZZLE", // 3xx - Drizzle
  THUNDERSTORM = "THUNDERSTORM", // 2xx - Thunderstorm
  SNOW = "SNOW", // 6xx - Snow
  MIST = "MIST", // 7xx - Mist/Fog/Haze
}

/**
 * Map OpenWeather weather condition ID to our standardized condition
 * @param weatherId OpenWeather condition code (200-804)
 * @returns Standardized WeatherCondition enum value
 */
export function mapWeatherCondition(
  weatherId: number | null
): WeatherCondition {
  if (weatherId == null) return WeatherCondition.CLOUDY;

  // Clear sky
  if (weatherId === 800) return WeatherCondition.CLEAR;

  // Partly cloudy (few/scattered/broken clouds)
  if (weatherId >= 801 && weatherId <= 803)
    return WeatherCondition.PARTLY_CLOUDY;

  // Overcast
  if (weatherId === 804) return WeatherCondition.CLOUDY;

  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) return WeatherCondition.THUNDERSTORM;

  // Drizzle
  if (weatherId >= 300 && weatherId < 400) return WeatherCondition.DRIZZLE;

  // Rain
  if (weatherId >= 500 && weatherId < 600) return WeatherCondition.RAINY;

  // Snow
  if (weatherId >= 600 && weatherId < 700) return WeatherCondition.SNOW;

  // Atmosphere (mist, fog, haze, etc.)
  if (weatherId >= 700 && weatherId < 800) return WeatherCondition.MIST;

  // Default fallback
  return WeatherCondition.CLOUDY;
}
