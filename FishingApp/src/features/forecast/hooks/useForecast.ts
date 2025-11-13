import { useCallback, useEffect, useState } from "react";
import { getForecast, UnifiedForecast } from "../api/client";

type UseForecastOptions = {
  tz?: string;
  date?: string;
  cache?: boolean;
  skip?: boolean;
};

export function useForecast(
  lat?: number,
  lon?: number,
  { tz = "Europe/Athens", date, cache, skip }: UseForecastOptions = {}
) {
  const shouldFetch = lat != null && lon != null && !skip;
  const [data, setData] = useState<UnifiedForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(shouldFetch);
  const [error, setError] = useState<Error | null>(null);

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
      const result = await getForecast(lat!, lon!, tz, date, {
        cache,
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, tz, date, cache, shouldFetch, skip]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { data, loading, error, refetch: fetchForecast };
}
