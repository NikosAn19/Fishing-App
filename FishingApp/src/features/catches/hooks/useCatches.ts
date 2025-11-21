import { useCallback, useEffect, useMemo } from "react";
import { API_BASE } from "../../../config/api";
import { JSON_HEADERS } from "../../../utils/apiClient";
import { CatchItem, FishRecognitionResult } from "../types";
import { useCatchesStore } from "../../../stores/catchesStore";
import { shallow } from "zustand/shallow";

type UseCatchesOptions = {
  pageSize?: number;
  autoLoad?: boolean;
};

type CatchesResponse = {
  items: CatchItem[];
  total?: number;
};

export function useCatches({
  pageSize = 20,
  autoLoad = true,
}: UseCatchesOptions = {}) {
  const {
    items,
    total,
    page,
    loading,
    fetchingMore,
    refreshing,
    error,
    setLoading,
    setFetchingMore,
    setRefreshing,
    setError,
    setData,
    removeCatch,
  } = useCatchesStore(
    (state) => ({
      items: state.items,
      total: state.total,
      page: state.page,
      loading: state.loading,
      fetchingMore: state.fetchingMore,
      refreshing: state.refreshing,
      error: state.error,
      setLoading: state.actions.setLoading,
      setFetchingMore: state.actions.setFetchingMore,
      setRefreshing: state.actions.setRefreshing,
      setError: state.actions.setError,
      setData: state.actions.setData,
      removeCatch: state.actions.removeCatch,
    }),
    shallow
  );

  const canLoadMore = useMemo(() => {
    if (total == null) return false;
    return items.length < total;
  }, [items.length, total]);

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      const isFirstPage = targetPage === 1;

      if (isFirstPage) {
        setLoading(true);
        setError(null);
      } else {
        setFetchingMore(true);
      }

      try {
        const url = `${API_BASE}/api/catches?limit=${pageSize}&page=${targetPage}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as CatchesResponse;
        const newItems = json.items ?? [];
        const newTotal =
          json.total ?? (isFirstPage ? newItems.length : total ?? 0);

        setData(newItems, newTotal, targetPage, replace);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Αποτυχία φόρτωσης";
        setError(message);
        throw err;
      }
    },
    [pageSize, total, setData, setError, setFetchingMore, setLoading]
  );

  const loadInitial = useCallback(async () => {
    await load(1, true);
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true);
  }, [load, setRefreshing]);

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loading || fetchingMore) return;
    await load(page + 1, false);
  }, [canLoadMore, loading, fetchingMore, load, page]);

  useEffect(() => {
    if (!autoLoad) return;
    loadInitial().catch(() => {
      // error state handled inside load
    });
  }, [autoLoad, loadInitial]);

  const recognizeFish = useCallback(async (photoUrl: string) => {
    const response = await fetch(`${API_BASE}/api/fish/recognize`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ photoUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as FishRecognitionResult;
  }, []);

  const deleteCatch = useCallback(
    async (catchId: string) => {
      const response = await fetch(`${API_BASE}/api/catches/${catchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      removeCatch(catchId);
    },
    [removeCatch]
  );

  return {
    items,
    total,
    loading,
    fetchingMore,
    refreshing,
    error,
    canLoadMore,
    loadInitial,
    loadMore,
    refresh,
    recognizeFish,
    deleteCatch,
  };
}
