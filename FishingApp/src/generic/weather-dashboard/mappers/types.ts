import React from "react";

/** Location header data */
export type LocationHeaderData = {
  locationLabel: string;
  locationText: string;
};

/** Day selector data */
export type DaySelectorData = Array<{
  id: number;
  dayName: string;
  date: string;
}>;

/** Main card data */
export type MainCardData = {
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
  isDaytime: boolean;
  temp: number;
  high: number;
  low: number;
  score: number;
  statusItems: Array<{
    icon: React.ComponentType<{ size: number; color: string }>;
    text: string;
    isActive?: boolean;
    iconColor?: string;
  }>;
};

/** Hourly forecast data */
export type HourlyForecastData = Array<{
  time: string;
  temp: number;
  weather:
    | "Sunny"
    | "Partly Cloudy"
    | "Cloudy"
    | "Rainy"
    | "Drizzle"
    | "Thunderstorm"
    | "Snow"
    | "Mist";
  isDaytime: boolean;
}>;

/** Stats grid data */
export type StatsGridData = Array<{
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBgColor?: string;
  label: string;
  value: string | React.ReactNode;
  subText?: string | React.ReactNode;
  valueStyle?: "default" | "moon" | "sea";
}>;

/** Sunrise/sunset data */
export type SunriseSunsetData = {
  sunrise: string;
  sunset: string;
};
