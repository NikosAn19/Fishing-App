import express from "express";
import { buildUnifiedForecast } from "../services/forecastAggregator";
const router = express.Router();

// @desc    Get unified forecast data for fishing
// @route   GET /api/forecast
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { lat, lon, tz = "Europe/Athens" } = req.query;

    if (!lat || !lon) {
      res.status(400).json({ error: "Latitude and longitude are required" });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    // Use real API data from OpenMeteo and other services
    const forecastData = await buildUnifiedForecast(
      latitude,
      longitude,
      tz as string
    );

    res.json(forecastData);
  } catch (error) {
    console.error("Forecast API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
