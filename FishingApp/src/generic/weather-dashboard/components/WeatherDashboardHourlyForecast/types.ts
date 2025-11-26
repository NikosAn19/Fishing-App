import React from "react";
import { HourlyForecastData } from "../../mappers/types";

export type HourlyData = HourlyForecastData[number];

export interface WeatherDashboardHourlyForecastProps {
  title?: string;
  hourlyData: HourlyForecastData;
  getWeatherIcon?: (
    weather: string,
    size?: number,
    isDaytime?: boolean
  ) => React.ReactElement;
}
