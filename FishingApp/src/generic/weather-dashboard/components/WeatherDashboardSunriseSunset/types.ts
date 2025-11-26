export interface WeatherDashboardSunriseSunsetProps {
  sunrise: string;
  sunset: string;
  progress?: number; // 0-1, default calculated from current time
}
