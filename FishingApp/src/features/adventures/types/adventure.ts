export enum AdventureStatus {
  PLANNED = "planned",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FishingDetails {
  technique?: string;
  lures?: string[];
  notes?: string;
}

export interface Equipment {
  name: string;
  type?: string;
  notes?: string;
}

export interface Adventure {
  id: string;
  userId: string;
  status: AdventureStatus;
  coordinates: Coordinates;
  locationName?: string;
  date: string; // YYYY-MM-DD format
  fishingDetails?: FishingDetails;
  participants?: string[]; // User IDs
  equipment?: Equipment[];
  catches?: string[]; // Catch IDs
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string;
  completedAt?: string; // ISO string
}

export interface CreateAdventureRequest {
  coordinates: Coordinates;
  locationName?: string;
  date: string; // YYYY-MM-DD
  fishingDetails?: FishingDetails;
  participants?: string[];
  equipment?: Equipment[];
  notes?: string;
}

export interface UpdateAdventureRequest {
  status?: AdventureStatus;
  coordinates?: Coordinates;
  locationName?: string;
  date?: string; // YYYY-MM-DD
  fishingDetails?: FishingDetails;
  participants?: string[];
  equipment?: Equipment[];
  catches?: string[];
  notes?: string;
}

export interface GetAdventuresResponse {
  success: boolean;
  adventures: Adventure[];
}

export interface GetAdventureResponse {
  success: boolean;
  adventure: Adventure;
}

export interface CreateAdventureResponse {
  success: boolean;
  adventure: Adventure;
}

export interface UpdateAdventureResponse {
  success: boolean;
  adventure: Adventure;
}

export interface DeleteAdventureResponse {
  success: boolean;
  message?: string;
}

