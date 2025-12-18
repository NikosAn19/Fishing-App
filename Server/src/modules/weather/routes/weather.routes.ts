import express from "express";
import { WeatherController } from "../controllers/WeatherController";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { forecastSchema, dateForecastSchema } from "../../../middleware/validation/schemas/weatherSchema";
import { z } from "zod";

const router = express.Router();
const weatherController = new WeatherController();

router.get(
  "/",
  validateRequest(z.object({ query: forecastSchema })),
  weatherController.getUnifiedForecast.bind(weatherController)
);

router.get(
  "/date",
  validateRequest(z.object({ query: dateForecastSchema })),
  weatherController.getDateForecast.bind(weatherController)
);

export default router;
