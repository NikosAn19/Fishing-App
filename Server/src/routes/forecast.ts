import express from "express";
import { DEFAULT_TIMEZONE } from "../config/constants";
import { buildUnifiedForecast } from "../services/forecastAggregator";
import { z } from "zod";

const router = express.Router();

// Validation schema for date-specific forecast
const dateForecastSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  tz: z.string().default(DEFAULT_TIMEZONE),
});

// @desc    Get unified forecast data for fishing
// @route   GET /api/forecast
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { lat, lon, tz = DEFAULT_TIMEZONE } = req.query;

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

// @desc    Get weather forecast for specific date
// @route   GET /api/forecast/date
// @access  Public
router.get("/date", async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = dateForecastSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { lat, lon, date, tz } = validationResult.data;

    // Validate date is not in the past (except for today)
    const requestedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({
        error: "Date cannot be in the past",
        message: "Only current and future dates are allowed",
      });
    }

    // Calculate date range (same day for hourly data)
    const startDate = date;
    const endDate = date; // Same day for hourly forecast

    console.log(
      `🌤️ Fetching forecast for ${date} at coordinates ${lat}, ${lon}`
    );

    // Get forecast data for the specific date
    const forecastData = await buildUnifiedForecast(
      lat,
      lon,
      tz,
      startDate,
      endDate
    );

    // Add metadata about the requested date
    const response = {
      ...forecastData,
      meta: {
        ...forecastData.meta,
        requestedDate: date,
        dateRange: { startDate, endDate },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("Date forecast API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
