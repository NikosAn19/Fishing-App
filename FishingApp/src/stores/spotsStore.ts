import { create } from "zustand";
import { FishingSpot } from "../types";

interface SpotsState {
  spots: FishingSpot[];
  selectedSpot: FishingSpot | null;
  isLoading: boolean;
  error: string | null;
}

interface SpotsActions {
  // Actions
  addSpot: (spot: Omit<FishingSpot, "id" | "createdAt" | "updatedAt">) => void;
  updateSpot: (id: string, updates: Partial<FishingSpot>) => void;
  deleteSpot: (id: string) => void;
  selectSpot: (spot: FishingSpot | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type SpotsStore = SpotsState & SpotsActions;

export const useSpotsStore = create<SpotsStore>((set, get) => ({
  // Initial state
  spots: [
    {
      id: "1",
      name: "Lake View",
      locationId: "1", // Reference to LocationInfo
      locationName: "Mountain Region",
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      rating: 4.5,
      fish: ["Bass", "Trout", "Pike"],
      distance: "2.5 km",
      depth: "3-8m",
      crowdLevel: "medium",
      description: "Beautiful mountain lake with clear water",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "River Bend",
      locationId: "2", // Reference to LocationInfo
      locationName: "Valley Area",
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      rating: 4.2,
      fish: ["Salmon", "Trout"],
      distance: "5.1 km",
      depth: "1-4m",
      crowdLevel: "low",
      description: "Peaceful river spot with good current",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Coastal Pier",
      locationId: "3", // Reference to LocationInfo
      locationName: "Beach Front",
      coordinates: { latitude: 40.7505, longitude: -73.9934 },
      rating: 4.8,
      fish: ["Sea Bass", "Mackerel", "Tuna"],
      distance: "12.3 km",
      depth: "5-15m",
      crowdLevel: "high",
      description: "Popular coastal fishing spot",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  selectedSpot: null,
  isLoading: false,
  error: null,

  // Actions
  addSpot: (spotData) => {
    const newSpot: FishingSpot = {
      ...spotData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      spots: [...state.spots, newSpot],
    }));
  },

  updateSpot: (id, updates) => {
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === id ? { ...spot, ...updates, updatedAt: new Date() } : spot
      ),
    }));
  },

  deleteSpot: (id) => {
    set((state) => ({
      spots: state.spots.filter((spot) => spot.id !== id),
      selectedSpot: state.selectedSpot?.id === id ? null : state.selectedSpot,
    }));
  },

  selectSpot: (spot) => {
    set({ selectedSpot: spot });
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
}));
