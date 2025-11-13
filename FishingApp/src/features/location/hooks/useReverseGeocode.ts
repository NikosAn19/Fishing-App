import * as Location from "expo-location";
import { useEffect, useState } from "react";

/** Επιστρέφει \"Πόλη, CC\" από lat/lon (fallback σε \"lat, lon\"). */
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

        if (__DEV__) {
          console.log("Reverse geocoding result:", p);
        }

        const locationParts: string[] = [];

        const locationFields = [
          (p as any)?.subLocality,
          (p as any)?.locality,
          (p as any)?.subregion,
          (p as any)?.district,
          p?.city,
          p?.region,
        ];

        locationFields.forEach((field) => {
          if (field && !locationParts.includes(field)) {
            locationParts.push(field);
          }
        });

        if (locationParts.length === 0 && p?.name) {
          locationParts.push(p.name);
        }

        let locationString = "";

        if (locationParts.length > 0) {
          if (locationParts.length >= 2) {
            locationString = locationParts.slice(0, 2).join(", ");
          } else {
            locationString = locationParts[0];
          }
        }

        const nice = locationString || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

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

/** Enhanced reverse geocoding που επιστρέφει λεπτομερείς πληροφορίες */
export function useDetailedReverseGeocode(lat?: number, lon?: number) {
  const [locationData, setLocationData] = useState<{
    village?: string;
    area?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    fullName: string;
    shortName: string;
  } | null>(null);

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

        if (p) {
          const data = {
            village: (p as any)?.subLocality || undefined,
            area: (p as any)?.locality || undefined,
            district:
              (p as any)?.subregion || (p as any)?.district || undefined,
            city: p?.city || undefined,
            region: p?.region || undefined,
            country:
              p?.isoCountryCode ||
              (p?.country ? p.country.split(" ").slice(-1)[0] : "") ||
              undefined,
            fullName: "",
            shortName: "",
          };

          const fullParts = [
            data.village,
            data.area,
            data.district,
            data.city,
            data.region,
          ].filter(Boolean);

          data.fullName =
            fullParts.length > 0
              ? `${fullParts.join(", ")}, ${data.country}`
              : `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

          const shortParts = [data.village, data.area, data.city].filter(
            Boolean
          );

          data.shortName =
            shortParts.length > 0 ? shortParts.join(", ") : data.fullName;

          setLocationData(data);
        }
      } catch {
        setLocationData({
          fullName: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
          shortName: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return locationData;
}
