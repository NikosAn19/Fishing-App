import { create } from 'zustand';

interface LocationState {
  coords: { lat: number; lon: number } | null;
  loading: boolean;
  error: Error | null;
  
  setCoords: (lat: number, lon: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  loading: false, // Default to false, let the hook or splash manage it
  error: null,

  setCoords: (lat, lon) => set({ coords: { lat, lon }, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
