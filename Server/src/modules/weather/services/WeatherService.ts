import { buildUnifiedForecast, UnifiedForecast } from "./ForecastAggregator";
import WeatherSnapshotModel from "../models/WeatherSnapshot";
import { AppError } from "../../../middleware/error/AppError";

const SNAPSHOT_TTL_MIN = Number(process.env.SNAPSHOT_TTL_MIN ?? 60);
const SNAPSHOT_TTL_MS = SNAPSHOT_TTL_MIN * 60 * 1000;

export class WeatherService {
  public async getUnifiedForecast(
    lat: number,
    lon: number,
    tz: string = "UTC",
    bypassCache: boolean = false
  ): Promise<{ data: UnifiedForecast; source: "cache" | "live" }> {
    const spotKey = `${lat.toFixed(4)},${lon.toFixed(4)}:${tz}`;

    // 1. Try Cache
    if (!bypassCache) {
      const recent = await WeatherSnapshotModel.findOne({ spotKey })
        .sort({ ts: -1 })
        .lean();

      if (
        recent &&
        recent.ts &&
        Date.now() - new Date(recent.ts).getTime() < SNAPSHOT_TTL_MS
      ) {
        return { data: recent.payload as UnifiedForecast, source: "cache" };
      }
    }

    // 2. Fetch Live
    try {
      const payload = await buildUnifiedForecast(lat, lon, tz);

      // 3. Store Cache (async, don't block)
      WeatherSnapshotModel.create({
        spotKey,
        ts: new Date(),
        payload,
        meta: { version: 1 },
      }).catch((err) => console.warn("Snapshot store failed:", err));

      return { data: payload, source: "live" };
    } catch (error) {
      console.error("buildUnifiedForecast failed:", error);
      throw new AppError("Failed to fetch forecast from upstream providers", 502);
    }
  }

  public async getDateForecast(
    lat: number,
    lon: number,
    date: string,
    tz: string = "UTC"
  ) {
      // Logic for specific date forecast
      const payload = await buildUnifiedForecast(lat, lon, tz, date, date);
      return payload;
  }
}
