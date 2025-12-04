import * as Location from "expo-location";
import { useEffect, useCallback } from "react";
import { useLocationStore } from "../stores/locationStore";

export function useCurrentLocation() {
  const coords = useLocationStore((state) => state.coords);
  const loading = useLocationStore((state) => state.loading);
  const error = useLocationStore((state) => state.error);
  const setCoords = useLocationStore((state) => state.setCoords);
  const setLoading = useLocationStore((state) => state.setLoading);
  const setError = useLocationStore((state) => state.setError);

  const fetchOnce = useCallback(async () => {
    // If we already have coords, don't fetch again automatically
    if (coords) {
        return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords(pos.coords.latitude, pos.coords.longitude);
    } catch (e: any) {
      setError(e);
    }
  }, [coords, setLoading, setCoords, setError]);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("Location permission denied");
        const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        setCoords(pos.coords.latitude, pos.coords.longitude);
      } catch(e: any) {
          setError(e);
      }
  }, [setLoading, setCoords, setError]);

  return { coords, loading, error, refetch };
}
