import { create } from "zustand";
import { WeatherInfo, WeatherForecast } from "../types";

interface WeatherState {
  currentWeather: WeatherInfo | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface WeatherActions {
  setWeather: (weather: WeatherInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateLastUpdated: () => void;
}

type WeatherStore = WeatherState & WeatherActions;

export const useWeatherStore = create<WeatherStore>((set) => ({
  // Initial state
  currentWeather: {
    temperature: 22,
    feelsLike: 24,
    humidity: 65,
    windSpeed: 8,
    windDirection: "NE",
    conditions: "Partly Cloudy",
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    sunrise: "06:30",
    sunset: "19:45",
    forecast: [
      {
        date: new Date("2024-08-03"),
        temperature: { min: 18, max: 25 },
        conditions: "Sunny",
        humidity: 60,
        windSpeed: 5,
        precipitation: 0,
      },
      {
        date: new Date("2024-08-04"),
        temperature: { min: 16, max: 23 },
        conditions: "Cloudy",
        humidity: 75,
        windSpeed: 12,
        precipitation: 2,
      },
      {
        date: new Date("2024-08-05"),
        temperature: { min: 15, max: 20 },
        conditions: "Rain",
        humidity: 85,
        windSpeed: 15,
        precipitation: 8,
      },
    ],
  },
  isLoading: false,
  error: null,
  lastUpdated: new Date(),

  // Actions
  setWeather: (weather) => {
    set({ currentWeather: weather, lastUpdated: new Date() });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  updateLastUpdated: () => {
    set({ lastUpdated: new Date() });
  },
}));
