import { useEffect, useState } from "react";
import { getForecast, UnifiedForecast } from "../api/client";

export function useForecast(lat?: number, lon?: number, tz = "Europe/Athens") {
  const [data, setData] = useState<UnifiedForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lat && lon));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (lat == null || lon == null) return;
    let cancel = false;
    setLoading(true);
    getForecast(lat, lon, tz)
      .then((f) => !cancel && (setData(f), setError(null)))
      .catch((e) => !cancel && setError(e as Error))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [lat, lon, tz]);

  return { data, loading, error };
}
