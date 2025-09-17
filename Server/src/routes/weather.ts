import express from "express";
const router = express.Router();

// @desc    Get weather data for location
// @route   GET /api/weather
// @access  Public
router.get("/", (req, res) => {
  const { lat, lon } = req.query;

  // Mock weather data for now
  res.json({
    message: "Weather endpoint",
    location: {
      latitude: lat || 37.9755,
      longitude: lon || 23.7348,
    },
    current: {
      temperature: 22,
      humidity: 65,
      windSpeed: 12,
      windDirection: "NE",
      conditions: "Partly Cloudy",
      visibility: 10,
      pressure: 1013,
      uvIndex: 6,
    },
    forecast: [
      {
        date: "2024-01-15",
        high: 24,
        low: 18,
        conditions: "Sunny",
        windSpeed: 8,
        precipitation: 0,
      },
      {
        date: "2024-01-16",
        high: 21,
        low: 16,
        conditions: "Cloudy",
        windSpeed: 15,
        precipitation: 20,
      },
    ],
    fishing: {
      score: 76,
      conditions: "Good",
      bestTimes: ["06:00-08:00", "18:00-20:00"],
      recommendations: [
        "Light winds make for good surface fishing",
        "Rising pressure - fish may be more active",
        "Try spinning with small lures",
      ],
    },
  });
});

// @desc    Get marine forecast
// @route   GET /api/weather/marine
// @access  Public
router.get("/marine", (req, res) => {
  res.json({
    message: "Marine forecast endpoint",
    data: {
      waveHeight: 0.8,
      wavePeriod: 6,
      waveDirection: "SW",
      seaTemperature: 18,
      tides: [
        { time: "06:15", type: "low", height: 0.2 },
        { time: "12:30", type: "high", height: 1.4 },
        { time: "18:45", type: "low", height: 0.3 },
      ],
    },
  });
});

export default router;










