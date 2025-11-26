import { useCallback, useEffect } from "react";
import { useFavoriteSpotsStore } from "../stores/favoriteSpotsStore";
import { useShallow } from "zustand/react/shallow";
import { FavoriteSpot } from "../types/maps";
import { CreateFavoriteSpotRequest } from "../types/favoriteSpotsApiTypes";

export interface UseFavoriteSpotsOptions {
  autoLoad?: boolean;
}

export function useFavoriteSpots({
  autoLoad = false,
}: UseFavoriteSpotsOptions = {}) {
  const {
    favoriteSpots,
    loading,
    error,
    setLoading,
    setError,
    syncFromBackend,
    addFavoriteSpotToBackend,
    deleteFavoriteSpotFromBackend,
  } = useFavoriteSpotsStore(
    useShallow((state) => ({
      favoriteSpots: state.favoriteSpots,
      loading: state.loading,
      error: state.error,
      setLoading: state.actions.setLoading,
      setError: state.actions.setError,
      syncFromBackend: state.actions.syncFromBackend,
      addFavoriteSpotToBackend: state.actions.addFavoriteSpotToBackend,
      deleteFavoriteSpotFromBackend:
        state.actions.deleteFavoriteSpotFromBackend,
    }))
  );

  const loadFavoriteSpots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await syncFromBackend();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load favorite spots";
      setError(message);
      throw err;
    }
  }, [setLoading, setError, syncFromBackend]);

  const refreshFavoriteSpots = useCallback(async () => {
    await loadFavoriteSpots();
  }, [loadFavoriteSpots]);

  const createFavoriteSpot = useCallback(
    async (data: CreateFavoriteSpotRequest): Promise<FavoriteSpot> => {
      try {
        const spot = await addFavoriteSpotToBackend(data);
        return spot;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create favorite spot";
        setError(message);
        throw err;
      }
    },
    [addFavoriteSpotToBackend, setError]
  );

  const deleteFavoriteSpot = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteFavoriteSpotFromBackend(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete favorite spot";
        setError(message);
        throw err;
      }
    },
    [deleteFavoriteSpotFromBackend, setError]
  );

  useEffect(() => {
    if (autoLoad) {
      loadFavoriteSpots();
    }
  }, [autoLoad, loadFavoriteSpots]);

  return {
    favoriteSpots,
    loading,
    error,
    loadFavoriteSpots,
    refreshFavoriteSpots,
    createFavoriteSpot,
    deleteFavoriteSpot,
  };
}
