// src/routes/forecast.ts
import { Router } from "express";
import { z } from "zod";
import WeatherSnapshotModel from "../models/WeatherSnapshot";
import { buildUnifiedForecast } from "../services/forecastAggregator";

const router = Router();

// TTL λεπτά για το snapshot cache (env ή 60')
const SNAPSHOT_TTL_MIN = Number(process.env.SNAPSHOT_TTL_MIN ?? 60);
const SNAPSHOT_TTL_MS = SNAPSHOT_TTL_MIN * 60 * 1000;

const qSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  tz: z.string().default(process.env.DEFAULT_TIMEZONE || "UTC"),
  cache: z.coerce.boolean().default(true),
});

router.get("/", async (req, res) => {
  try {
    const { lat, lon, tz, cache } = qSchema.parse(req.query);
    const spotKey = `${lat.toFixed(4)},${lon.toFixed(4)}:${tz}`;

    // Βάλε μερικά χρήσιμα headers για debug/observability
    res.setHeader("X-Spot-Key", spotKey);
    res.setHeader("X-Snapshot-TTL", `${SNAPSHOT_TTL_MIN}m`);
    if (!cache) {
      // Ζητήθηκε παράκαμψη cache από client
      res.setHeader("Cache-Control", "no-store");
    }

    // 1) Cache (τελευταίο SNAPSHOT_TTL_MIN)
    if (cache) {
      const recent = await WeatherSnapshotModel.findOne({ spotKey })
        .sort({ ts: -1 })
        .lean();

      if (
        recent &&
        recent.ts &&
        Date.now() - new Date(recent.ts).getTime() < SNAPSHOT_TTL_MS
      ) {
        res.setHeader("X-Source", "cache");
        return res.json({ source: "cache", ...recent.payload });
      }
    }

    // 2) Ζωντανό fetch & ενοποίηση
    //    (O aggregator σου τώρα τραβάει: άνεμο από One Call 3.0,
    //     moon από One Call 3.0, ατμοσφαιρικά από Open-Meteo (χωρίς άνεμο),
    //     marine/SST από Open-Meteo Marine)
    let payload;
    try {
      payload = await buildUnifiedForecast(lat, lon, tz);
    } catch (upstreamErr: any) {
      // Αν ο upstream πάροχος (OW/OM) έσκασε, γύρνα 502
      console.error("buildUnifiedForecast failed:", upstreamErr);
      return res
        .status(502)
        .json({ error: "upstream_failed", message: String(upstreamErr?.message || upstreamErr) });
    }

    // 3) Store snapshot (μην μπλοκάρεις το response αν αποτύχει)
    try {
      await WeatherSnapshotModel.create({
        spotKey,
        ts: new Date(),
        payload,
        meta: { version: 1 },
      });
    } catch (storeErr) {
      console.warn("Snapshot store failed:", storeErr);
    }

    res.setHeader("X-Source", "live");
    return res.json({ source: "live", ...payload });
  } catch (err: any) {
    // Zod/validation ή άλλες 4xx περιπτώσεις
    console.error("forecast route error:", err);
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
});

export default router;
