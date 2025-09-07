// Weather-related types
export interface WeatherInfo {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  conditions: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherConditions {
  temperature: number;
  conditions: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "foggy"
  | "windy"
  | "sunny"
  | "partly-cloudy";

export type WindDirection =
  | "N"
  | "NNE"
  | "NE"
  | "ENE"
  | "E"
  | "ESE"
  | "SE"
  | "SSE"
  | "S"
  | "SSW"
  | "SW"
  | "WSW"
  | "W"
  | "WNW"
  | "NW"
  | "NNW";
