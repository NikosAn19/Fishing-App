import { create } from "zustand";
import { Adventure, AdventureStatus } from "../types/adventure";
import { AdventuresState, AdventuresStore } from "../types/adventuresStoreTypes";

const initialState: AdventuresState = {
  adventures: [],
  loading: false,
  refreshing: false,
  error: null,
};

export const useAdventuresStore = create<AdventuresStore>((set, get) => ({
  ...initialState,
  actions: {
    setLoading: (loading) => set({ loading }),
    setRefreshing: (refreshing) => set({ refreshing }),
    setError: (error) =>
      set({
        error,
        loading: false,
        refreshing: false,
      }),
    setAdventures: (adventures) =>
      set({
        adventures,
        loading: false,
        refreshing: false,
        error: null,
      }),
    addAdventure: (adventure) =>
      set((state) => ({
        adventures: [adventure, ...state.adventures],
      })),
    updateAdventure: (id, updates) =>
      set((state) => ({
        adventures: state.adventures.map((adv) =>
          adv.id === id ? { ...adv, ...updates } : adv
        ),
      })),
    removeAdventure: (id) =>
      set((state) => ({
        adventures: state.adventures.filter((adv) => adv.id !== id),
      })),
    refresh: async () => {
      // This will be implemented in the hook
      // Store just provides the interface
    },
    reset: () => set({ ...initialState }),
  },
}));

// Selectors for grouped adventures
export const selectPlannedAdventures = (state: AdventuresStore) =>
  state.adventures.filter((adv) => adv.status === AdventureStatus.PLANNED);

export const selectCompletedAdventures = (state: AdventuresStore) =>
  state.adventures.filter((adv) => adv.status === AdventureStatus.COMPLETED);

export const selectCancelledAdventures = (state: AdventuresStore) =>
  state.adventures.filter((adv) => adv.status === AdventureStatus.CANCELLED);
