import { z } from "zod";

export const forecastSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  tz: z.string().optional().default("UTC"),
  cache: z.coerce.boolean().optional().default(true),
});

export const dateForecastSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  tz: z.string().optional().default("UTC"),
});
