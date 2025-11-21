import { create } from "zustand";
import {
  FavoriteSpotsState,
  FavoriteSpotsActions,
  FavoriteSpotsStore,
} from "./types";
import { FavoriteSpot } from "../types/maps";
import {
  getFavoriteSpots,
  addFavoriteSpot,
  deleteFavoriteSpot,
} from "../api/client";
import { FavoriteSpot as ApiFavoriteSpot } from "../api/types";

const COORDINATE_TOLERANCE = 0.0001; // ~11 meters

const initialState: FavoriteSpotsState = {
  favoriteSpots: [],
  loading: false,
  error: null,
};

// Map backend FavoriteSpot to frontend FavoriteSpot format
const mapApiSpotToFrontendSpot = (apiSpot: ApiFavoriteSpot): FavoriteSpot => {
  return {
    ...apiSpot,
    createdAt: new Date(apiSpot.createdAt),
    updatedAt: new Date(apiSpot.updatedAt),
  };
};

export const useFavoriteSpotsStore = create<FavoriteSpotsStore>((set, get) => ({
  ...initialState,
  actions: {
    addFavoriteSpot: (spotData) => {
      const newSpot: FavoriteSpot = {
        ...spotData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        favoriteSpots: [...state.favoriteSpots, newSpot],
      }));
    },

    removeFavoriteSpot: (id) => {
      set((state) => ({
        favoriteSpots: state.favoriteSpots.filter((spot) => spot.id !== id),
      }));
    },

    updateFavoriteSpot: (id, updates) => {
      set((state) => ({
        favoriteSpots: state.favoriteSpots.map((spot) =>
          spot.id === id ? { ...spot, ...updates, updatedAt: new Date() } : spot
        ),
      }));
    },

    getFavoriteSpots: () => {
      return get().favoriteSpots;
    },

    isFavoriteSpot: (lat, lon) => {
      const spots = get().favoriteSpots;
      return spots.some(
        (spot) =>
          Math.abs(spot.latitude - lat) < COORDINATE_TOLERANCE &&
          Math.abs(spot.longitude - lon) < COORDINATE_TOLERANCE
      );
    },

    getFavoriteSpotById: (id) => {
      const spots = get().favoriteSpots;
      return spots.find((spot) => spot.id === id) || null;
    },

    syncFromBackend: async () => {
      set({ loading: true, error: null });
      try {
        const response = await getFavoriteSpots();
        const mappedSpots = response.favoriteSpots.map(
          mapApiSpotToFrontendSpot
        );
        set({
          favoriteSpots: mappedSpots,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load favorite spots";
        set({
          loading: false,
          error: message,
        });
        throw error;
      }
    },

    addFavoriteSpotToBackend: async (spotData) => {
      set({ loading: true, error: null });
      try {
        const response = await addFavoriteSpot(spotData);
        const mappedSpot = mapApiSpotToFrontendSpot(response.favoriteSpot);
        set((state) => ({
          favoriteSpots: [...state.favoriteSpots, mappedSpot],
          loading: false,
          error: null,
        }));
        return mappedSpot;
      } catch (error: any) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to add favorite spot";
        set({
          loading: false,
          error: message,
        });
        throw error;
      }
    },

    deleteFavoriteSpotFromBackend: async (id) => {
      set({ loading: true, error: null });
      try {
        await deleteFavoriteSpot(id);
        set((state) => ({
          favoriteSpots: state.favoriteSpots.filter((spot) => spot.id !== id),
          loading: false,
          error: null,
        }));
      } catch (error: any) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete favorite spot";
        set({
          loading: false,
          error: message,
        });
        throw error;
      }
    },

    setLoading: (loading) => {
      set({ loading });
    },

    setError: (error) => {
      set({ error });
    },
  },
}));
