export interface LocationInfo {
  id?: string;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
}

export interface FishingLocationInfo extends LocationInfo {
  waterType?: "freshwater" | "saltwater" | "brackish";
  depth?: number; // in meters
  temperature?: number; // in °C
  weatherConditions?: string;
  bestCatchTimes?: string[];
  averageCatchSize?: number; // in kg
}

export interface LocationFilterOptions {
  waterType?: ("freshwater" | "saltwater" | "brackish")[];
  depthRange?: [number, number];
  temperatureRange?: [number, number];
  hasFacilities?: boolean;
  accessibility?: "easy" | "moderate" | "difficult";
}

export interface SavedLocation extends LocationInfo {
  userId: string;
  notes?: string;
  tags?: string[];
  lastVisited?: Date;
  visitCount?: number;
  favorite?: boolean;
  photos?: string[];
}

export interface LocationHistoryEntry {
  locationId: string;
  visitedAt: Date;
  catchCount?: number;
  weatherSummary?: string;
  notes?: string;
}
