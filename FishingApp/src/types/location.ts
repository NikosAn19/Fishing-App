// Location-related types
export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: number;
}

export interface FishingLocationInfo extends LocationInfo {
  // Βασικά location data
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: number;

  // Fishing-specific data
  spotName?: string;
  spotType?: "coastal" | "lake" | "river" | "deep-sea";
  waterType?: "salt" | "fresh" | "brackish";
  depth?: number; // σε μέτρα
  accessibility?: "easy" | "medium" | "hard";
  parking?: boolean;
  facilities?: string[]; // ["toilet", "restaurant", "bait-shop"]

  // Weather data
  weather?: {
    temperature: number;
    windSpeed: number;
    conditions: string;
  };

  // User data
  visited?: boolean;
  favorite?: boolean;
  notes?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
