// Fishing-related types
import { LocationInfo } from "./location";
import { WeatherInfo } from "./weather";

export interface FishingSpot {
  id: string;
  name: string;

  // Location reference
  locationId?: string; // Reference to LocationInfo
  location?: LocationInfo; // Embedded location data

  // Backward compatibility
  locationName: string; // Keep for backward compatibility
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Spot characteristics
  rating?: number;
  fish: string[]; // Keep for backward compatibility
  fishSpecies?: Fish[]; // Full fish information
  distance: string;
  depth?: string;
  crowdLevel?: "low" | "medium" | "high";
  description?: string;
  // Maps images
  mapsImages?: {
    satellite?: string;
    hybrid?: string;
    terrain?: string;
    roadmap?: string;
    streetView?: string;
    streetViewNorth?: string;
    streetViewEast?: string;
    streetViewSouth?: string;
    streetViewWest?: string;
    thumbnail?: string;
    highRes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface FishCatch {
  id: string;

  // References to other entities
  fishId?: string; // Reference to Fish type
  spotId: string; // Reference to FishingSpot
  locationId?: string; // Reference to LocationInfo (where it was caught)
  weatherId?: string; // Reference to WeatherInfo (weather when caught)

  // Backward compatibility fields
  fishType: string; // Keep for backward compatibility
  spotName: string; // Keep for backward compatibility

  // Catch-specific data
  weight: number; // in kg
  length: number; // in cm
  date: Date;
  bait: string;
  technique: string;
  notes?: string;
  imageUrl?: string;

  // Embedded data for quick access (optional)
  fish?: Fish; // Full fish information
  location?: LocationInfo; // Full location information
  weather?: WeatherInfo; // Full weather information
  // Maps images for catch location
  mapsImages?: {
    satellite?: string;
    hybrid?: string;
    terrain?: string;
    roadmap?: string;
    streetView?: string;
    streetViewNorth?: string;
    streetViewEast?: string;
    streetViewSouth?: string;
    streetViewWest?: string;
    thumbnail?: string;
    highRes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface FishingTrip {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;

  // References to other entities
  spots: string[]; // Array of spot IDs
  catches: string[]; // Array of catch IDs
  weatherId?: string; // Reference to WeatherInfo

  // Embedded data for quick access
  weather?: WeatherInfo; // Full weather information

  // Trip summary
  notes?: string;
  totalCatches: number;
  totalWeight: number;

  createdAt: Date;
  updatedAt: Date;
}

export type FishSpecies =
  | "sea-bass"
  | "sea-bream"
  | "red-mullet"
  | "grouper"
  | "tuna"
  | "mackerel"
  | "sardine"
  | "anchovy"
  | "other";

export type BaitType =
  | "worm"
  | "shrimp"
  | "squid"
  | "fish-bait"
  | "artificial-lure"
  | "bread"
  | "other";

export type FishingTechnique =
  | "casting"
  | "trolling"
  | "bottom-fishing"
  | "float-fishing"
  | "spinning"
  | "fly-fishing"
  | "other";

// Fish characteristics and information
export interface Fish {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  genus?: string;
  species?: string;

  // Physical characteristics
  averageWeight: number; // in kg
  averageLength: number; // in cm
  maxWeight?: number; // in kg
  maxLength?: number; // in cm
  minWeight?: number; // in kg
  minLength?: number; // in cm

  // Habitat and behavior
  habitat: FishHabitat[];
  depthRange: {
    min: number; // in meters
    max: number; // in meters
  };
  waterType: "salt" | "fresh" | "brackish";
  temperatureRange: {
    min: number; // in Celsius
    max: number; // in Celsius
  };

  // Fishing information
  bestBait: BaitType[];
  bestTechniques: FishingTechnique[];
  bestTime: {
    season: FishSeason[];
    timeOfDay: TimeOfDay[];
    tide?: TideCondition[];
  };

  // Conservation
  conservationStatus?: ConservationStatus;
  fishingRegulations?: {
    minSize?: number; // in cm
    closedSeason?: {
      start: string; // MM-DD format
      end: string; // MM-DD format
    };
    dailyLimit?: number;
    protected?: boolean;
  };

  // Additional info
  description?: string;
  imageUrl?: string;
  // Maps images
  mapsImages?: {
    satellite?: string;
    hybrid?: string;
    terrain?: string;
    roadmap?: string;
    streetView?: string;
    streetViewNorth?: string;
    streetViewEast?: string;
    streetViewSouth?: string;
    streetViewWest?: string;
    thumbnail?: string;
    highRes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type FishHabitat =
  | "coastal"
  | "deep-sea"
  | "reef"
  | "lake"
  | "river"
  | "stream"
  | "estuary"
  | "lagoon"
  | "open-ocean"
  | "continental-shelf";

export type FishSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "year-round";

export type TimeOfDay = "dawn" | "morning" | "afternoon" | "dusk" | "night";

export type TideCondition =
  | "high-tide"
  | "low-tide"
  | "rising-tide"
  | "falling-tide"
  | "any";

export type ConservationStatus =
  | "least-concern"
  | "near-threatened"
  | "vulnerable"
  | "endangered"
  | "critically-endangered"
  | "extinct-in-wild"
  | "extinct";
