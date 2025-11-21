import { StatusItem } from "../types/shared";

export interface WeatherDashboardMainCardProps {
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
  isDaytime?: boolean; // Default true
  temp: number;
  high: number;
  low: number;
  score: number; // 0-100
  statusItems: StatusItem[];
}
