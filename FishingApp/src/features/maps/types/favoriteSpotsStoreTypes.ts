import { FavoriteSpot } from "../types/maps";

export interface FavoriteSpotsState {
  favoriteSpots: FavoriteSpot[];
  loading: boolean;
  error: string | null;
}

export interface FavoriteSpotsActions {
  addFavoriteSpot: (
    spot: Omit<FavoriteSpot, "id" | "createdAt" | "updatedAt">
  ) => void;
  removeFavoriteSpot: (id: string) => void;
  updateFavoriteSpot: (id: string, updates: Partial<FavoriteSpot>) => void;
  getFavoriteSpots: () => FavoriteSpot[];
  isFavoriteSpot: (lat: number, lon: number) => boolean;
  getFavoriteSpotById: (id: string) => FavoriteSpot | null;
  syncFromBackend: () => Promise<void>;
  addFavoriteSpotToBackend: (
    spotData: Omit<FavoriteSpot, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<FavoriteSpot>;
  deleteFavoriteSpotFromBackend: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type FavoriteSpotsStore = FavoriteSpotsState & {
  actions: FavoriteSpotsActions;
};
