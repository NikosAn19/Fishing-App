export interface FavoriteSpot {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateFavoriteSpotRequest {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  notes?: string;
}

export interface GetFavoriteSpotsResponse {
  success: boolean;
  favoriteSpots: FavoriteSpot[];
}

export interface CreateFavoriteSpotResponse {
  success: boolean;
  favoriteSpot: FavoriteSpot;
}

export interface DeleteFavoriteSpotResponse {
  success: boolean;
  message?: string;
}
