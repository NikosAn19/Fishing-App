// Sunrise-Sunset (free, no key). Επιστρέφει ISO UTC.
export async function fetchSunTimes(
  lat: number,
  lon: number,
  dateISO?: string
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lon),
    formatted: "0",
  });
  if (dateISO) params.set("date", dateISO.split("T")[0]!);
  const res = await fetch(`https://api.sunrise-sunset.org/json?${params}`);
  if (!res.ok) throw new Error(`Sunrise-Sunset HTTP ${res.status}`);
  const data = (await res.json()) as { results: any };
  return data.results as {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
}
