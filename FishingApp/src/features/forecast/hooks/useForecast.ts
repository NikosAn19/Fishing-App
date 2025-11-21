import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TIMEZONE } from "../../../config/time";
import { UnifiedForecast } from "../api/types";
import { UseForecastOptions } from "./types";
import { useForecastCacheStore } from "../stores/forecastCacheStore";

export function useForecast(
  lat?: number,
  lon?: number,
  { tz = DEFAULT_TIMEZONE, date, cache, skip }: UseForecastOptions = {}
) {
  const shouldFetch = lat != null && lon != null && !skip;
  const [data, setData] = useState<UnifiedForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(shouldFetch);
  const [error, setError] = useState<Error | null>(null);

  const { actions, loading: cacheLoading } = useForecastCacheStore();

  const fetchForecast = useCallback(async () => {
    if (!shouldFetch) {
      setLoading(false);
      if (skip) {
        setData(null);
        setError(null);
      }
      return;
    }

    setLoading(true);
    try {
      // Use cache store to fetch and cache
      const forecast = await actions.fetchAndCache(lat!, lon!, cache === false);

      // If date is specified, get forecast for that day
      if (date) {
        const dayIndex = Math.floor(
          (new Date(date).getTime() - new Date().getTime()) /
            (24 * 60 * 60 * 1000)
        );
        const dayForecast = actions.getForecastForDay(lat!, lon!, dayIndex);
        setData(dayForecast || forecast);
      } else {
        setData(forecast);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, date, cache, shouldFetch, skip, actions]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    data,
    loading: loading || cacheLoading,
    error,
    refetch: fetchForecast,
  };
}
