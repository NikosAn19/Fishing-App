// src/features/forecast/hooks/useReverseGeocode.ts
import * as Location from "expo-location";
import { useEffect, useState } from "react";

/** Επιστρέφει "Πόλη, CC" από lat/lon (fallback σε "lat, lon"). */
export function useReverseGeocode(lat?: number, lon?: number) {
  const [label, setLabel] = useState<string>("—");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (lat == null || lon == null) return;

      try {
        const res = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });

        if (cancelled) return;

        const p = res?.[0];
        // Προτεραιότητα: city > subregion/district > locality > region > name
        const city =
          p?.city ||
          (p as any)?.subregion ||
          (p as any)?.district ||
          (p as any)?.locality ||
          p?.region ||
          p?.name ||
          "";

        const country =
          p?.isoCountryCode ||
          (p?.country ? p.country.split(" ").slice(-1)[0] : "");

        const nice =
          [city, country].filter(Boolean).join(", ") ||
          `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

        setLabel(nice);
      } catch {
        setLabel(`${lat.toFixed(3)}, ${lon.toFixed(3)}`);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return label;
}
