import { Adventure } from "../types/adventure";

export interface AdventuresState {
  adventures: Adventure[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface AdventuresActions {
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  setAdventures: (adventures: Adventure[]) => void;
  addAdventure: (adventure: Adventure) => void;
  updateAdventure: (id: string, updates: Partial<Adventure>) => void;
  removeAdventure: (id: string) => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export type AdventuresStore = AdventuresState & { actions: AdventuresActions };
