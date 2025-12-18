import { z } from "zod";

export const createFavoriteSpotSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});
