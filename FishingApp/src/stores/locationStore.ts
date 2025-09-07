import { create } from "zustand";
import { LocationService } from "../services/locationService";
import { LocationInfo } from "../types";

interface LocationState {
  currentLocation: LocationInfo | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface LocationActions {
  getCurrentLocation: () => Promise<void>;
  getLastKnownLocation: () => Promise<void>;
  requestPermissions: () => Promise<void>;
  setLocation: (location: LocationInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>((set, get) => ({
  // Initial state
  currentLocation: null,
  isLoading: false,
  error: null,
  hasPermission: false,

  // Actions
  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });

    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        set({
          currentLocation: location,
          hasPermission: true,
          isLoading: false,
        });
      } else {
        set({
          error: "Could not get current location",
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: "Error getting location",
        isLoading: false,
      });
    }
  },

  getLastKnownLocation: async () => {
    set({ isLoading: true, error: null });

    try {
      const location = await LocationService.getLastKnownLocation();
      if (location) {
        set({
          currentLocation: location,
          hasPermission: true,
          isLoading: false,
        });
      } else {
        set({
          error: "No last known location",
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: "Error getting last known location",
        isLoading: false,
      });
    }
  },

  requestPermissions: async () => {
    try {
      const granted = await LocationService.requestPermissions();
      set({ hasPermission: granted });
      if (granted) {
        // Automatically get location after permission is granted
        get().getCurrentLocation();
      }
    } catch (error) {
      set({ error: "Error requesting permissions" });
    }
  },

  setLocation: (location: LocationInfo) => {
    set({ currentLocation: location });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
