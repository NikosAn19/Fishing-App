import { create } from "zustand";
import { CatchItem } from "../features/catches/types";

interface CatchesState {
  items: CatchItem[];
  total: number | null;
  page: number;
  loading: boolean;
  fetchingMore: boolean;
  refreshing: boolean;
  error: string | null;
}

interface CatchesActions {
  setLoading: (loading: boolean) => void;
  setFetchingMore: (value: boolean) => void;
  setRefreshing: (value: boolean) => void;
  setError: (error: string | null) => void;
  setData: (
    items: CatchItem[],
    total: number | null,
    page: number,
    replace: boolean
  ) => void;
  removeCatch: (id: string) => void;
  reset: () => void;
}

type CatchesStore = CatchesState & { actions: CatchesActions };

const initialState: CatchesState = {
  items: [],
  total: null,
  page: 1,
  loading: false,
  fetchingMore: false,
  refreshing: false,
  error: null,
};

export const useCatchesStore = create<CatchesStore>((set) => ({
  ...initialState,
  actions: {
    setLoading: (loading) => set({ loading }),
    setFetchingMore: (value) => set({ fetchingMore: value }),
    setRefreshing: (value) => set({ refreshing: value }),
    setError: (error) =>
      set({
        error,
        loading: false,
        fetchingMore: false,
        refreshing: false,
      }),
    setData: (items, total, page, replace) =>
      set((state) => ({
        items: replace ? items : [...state.items, ...items],
        total,
        page,
        loading: false,
        fetchingMore: false,
        refreshing: false,
        error: null,
      })),
    removeCatch: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        total: state.total == null ? state.total : Math.max(state.total - 1, 0),
      })),
    reset: () => set({ ...initialState }),
  },
}));
