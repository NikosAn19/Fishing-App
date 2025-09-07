import { create } from "zustand";
import { FishCatch } from "../types";

interface CatchesState {
  catches: FishCatch[];
  selectedCatch: FishCatch | null;
  isLoading: boolean;
  error: string | null;
  totalCatches: number;
  totalWeight: number;
}

interface CatchesActions {
  // Actions
  addCatch: (
    catchData: Omit<FishCatch, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCatch: (id: string, updates: Partial<FishCatch>) => void;
  deleteCatch: (id: string) => void;
  selectCatch: (catchItem: FishCatch | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getCatchesBySpot: (spotId: string) => FishCatch[];
  getCatchesByDate: (startDate: Date, endDate: Date) => FishCatch[];
}

type CatchesStore = CatchesState & CatchesActions;

export const useCatchesStore = create<CatchesStore>((set, get) => ({
  // Initial state
  catches: [
    {
      id: "1",
      fishId: "1", // Reference to Fish
      fishType: "Bass",
      weight: 2.5,
      length: 45,
      spotId: "1",
      spotName: "Lake View",
      locationId: "1", // Reference to LocationInfo
      weatherId: "1", // Reference to WeatherInfo
      date: new Date("2024-08-02T10:30:00"),
      bait: "Worm",
      technique: "Spinning",
      notes: "Caught near the rocks",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      fishId: "2", // Reference to Fish
      fishType: "Trout",
      weight: 1.8,
      length: 35,
      spotId: "2",
      spotName: "River Bend",
      locationId: "2", // Reference to LocationInfo
      weatherId: "2", // Reference to WeatherInfo
      date: new Date("2024-08-01T14:15:00"),
      bait: "Fly",
      technique: "Fly Fishing",
      notes: "Beautiful rainbow trout",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      fishId: "3", // Reference to Fish
      fishType: "Sea Bass",
      weight: 3.2,
      length: 50,
      spotId: "3",
      spotName: "Coastal Pier",
      locationId: "3", // Reference to LocationInfo
      weatherId: "3", // Reference to WeatherInfo
      date: new Date("2024-07-30T16:45:00"),
      bait: "Squid",
      technique: "Bottom Fishing",
      notes: "Caught during sunset",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  selectedCatch: null,
  isLoading: false,
  error: null,
  totalCatches: 3,
  totalWeight: 7.5,

  // Actions
  addCatch: (catchData) => {
    const newCatch: FishCatch = {
      ...catchData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      catches: [...state.catches, newCatch],
      totalCatches: state.totalCatches + 1,
      totalWeight: state.totalWeight + newCatch.weight,
    }));
  },

  updateCatch: (id, updates) => {
    set((state) => {
      const oldCatch = state.catches.find((c) => c.id === id);
      const newCatch = oldCatch
        ? { ...oldCatch, ...updates, updatedAt: new Date() }
        : null;

      if (!newCatch) return state;

      const weightDifference = (updates.weight || 0) - (oldCatch?.weight || 0);

      return {
        catches: state.catches.map((catchItem) =>
          catchItem.id === id ? newCatch : catchItem
        ),
        totalWeight: state.totalWeight + weightDifference,
      };
    });
  },

  deleteCatch: (id) => {
    set((state) => {
      const catchToDelete = state.catches.find((c) => c.id === id);
      return {
        catches: state.catches.filter((catchItem) => catchItem.id !== id),
        selectedCatch:
          state.selectedCatch?.id === id ? null : state.selectedCatch,
        totalCatches: state.totalCatches - 1,
        totalWeight: state.totalWeight - (catchToDelete?.weight || 0),
      };
    });
  },

  selectCatch: (catchItem) => {
    set({ selectedCatch: catchItem });
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

  getCatchesBySpot: (spotId) => {
    return get().catches.filter((catchItem) => catchItem.spotId === spotId);
  },

  getCatchesByDate: (startDate, endDate) => {
    return get().catches.filter(
      (catchItem) => catchItem.date >= startDate && catchItem.date <= endDate
    );
  },
}));
