import { useCallback, useEffect, useMemo } from "react";
import { useAdventuresStore } from "../stores/adventuresStore";
import { useShallow } from "zustand/react/shallow";
import { adventuresApi } from "../api/client";
import {
  Adventure,
  AdventureStatus,
  CreateAdventureRequest,
  UpdateAdventureRequest,
} from "../types/adventure";
import { UseAdventuresOptions } from "../types/useAdventuresTypes";

export function useAdventures({
  autoLoad = true,
  status,
}: UseAdventuresOptions = {}) {
  const {
    adventures,
    loading,
    refreshing,
    error,
    setLoading,
    setRefreshing,
    setError,
    setAdventures,
    addAdventure,
    updateAdventure: updateAdventureInStore,
    removeAdventure: removeAdventureFromStore,
  } = useAdventuresStore(
    useShallow((state) => ({
      adventures: state.adventures,
      loading: state.loading,
      refreshing: state.refreshing,
      error: state.error,
      setLoading: state.actions.setLoading,
      setRefreshing: state.actions.setRefreshing,
      setError: state.actions.setError,
      setAdventures: state.actions.setAdventures,
      addAdventure: state.actions.addAdventure,
      updateAdventure: state.actions.updateAdventure,
      removeAdventure: state.actions.removeAdventure,
    }))
  );

  // Memoize selectors to prevent new array references on every render
  const planned = useMemo(
    () => adventures.filter((adv) => adv.status === AdventureStatus.PLANNED),
    [adventures]
  );

  const completed = useMemo(
    () => adventures.filter((adv) => adv.status === AdventureStatus.COMPLETED),
    [adventures]
  );

  const cancelled = useMemo(
    () => adventures.filter((adv) => adv.status === AdventureStatus.CANCELLED),
    [adventures]
  );

  const loadAdventures = useCallback(
    async (filterStatus?: AdventureStatus) => {
      setLoading(true);
      setError(null);

      try {
        const response = await adventuresApi.getAdventures(
          filterStatus || status
        );
        setAdventures(response.adventures);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load adventures";
        setError(message);
        throw err;
      }
    },
    [status] // Store actions (setLoading, setError, setAdventures) are stable and don't need to be in deps
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAdventures();
  }, [loadAdventures]); // setRefreshing is stable

  const createAdventure = useCallback(
    async (data: CreateAdventureRequest): Promise<Adventure> => {
      try {
        const response = await adventuresApi.createAdventure(data);
        addAdventure(response.adventure);
        return response.adventure;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create adventure";
        setError(message);
        throw err;
      }
    },
    [] // Store actions (addAdventure, setError) are stable
  );

  const updateAdventure = useCallback(
    async (id: string, data: UpdateAdventureRequest): Promise<Adventure> => {
      try {
        const response = await adventuresApi.updateAdventure(id, data);
        updateAdventureInStore(id, response.adventure);
        return response.adventure;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update adventure";
        setError(message);
        throw err;
      }
    },
    [] // Store actions (updateAdventureInStore, setError) are stable
  );

  const deleteAdventure = useCallback(
    async (id: string): Promise<void> => {
      try {
        await adventuresApi.deleteAdventure(id);
        removeAdventureFromStore(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete adventure";
        setError(message);
        throw err;
      }
    },
    [] // Store actions (removeAdventureFromStore, setError) are stable
  );

  useEffect(() => {
    if (!autoLoad) return;
    loadAdventures().catch(() => {
      // Error state handled inside loadAdventures
    });
  }, [autoLoad, loadAdventures]);

  return {
    adventures,
    planned,
    completed,
    cancelled,
    loading,
    refreshing,
    error,
    loadAdventures,
    refresh,
    createAdventure,
    updateAdventure,
    deleteAdventure,
  };
}
