import { useState, useCallback, useEffect, useMemo } from "react";
import { API_BASE } from "../../../config/api";
import { JSON_HEADERS } from "../../../utils/apiClient";
import { CatchItem, FishRecognitionResult } from "../types/catchTypes";

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
  // Internal state management using React hooks
  const [items, setItems] = useState<CatchItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Update state based on replace flag
        if (replace) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }
        setTotal(newTotal);
        setPage(targetPage);
        setLoading(false);
        setFetchingMore(false);
        setRefreshing(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Αποτυχία φόρτωσης";
        setError(message);
        setLoading(false);
        setFetchingMore(false);
        setRefreshing(false);
        throw err;
      }
    },
    [pageSize, total]
  );

  const loadInitial = useCallback(async () => {
    await load(1, true);
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loading || fetchingMore) return;
    await load(page + 1, false);
  }, [canLoadMore, loading, fetchingMore, load, page]);

  useEffect(() => {
    if (!autoLoad) return;
    loadInitial().catch(() => {
      // error state handled inside load
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]); // Only run on mount when autoLoad is true

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

      // Remove from local state
      setItems((prev) => prev.filter((item) => item.id !== catchId));
      setTotal((prev) => (prev !== null ? prev - 1 : null));
    },
    []
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
