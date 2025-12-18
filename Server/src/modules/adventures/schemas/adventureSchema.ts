import { z } from "zod";

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const fishingDetailsSchema = z.object({
  technique: z.string().optional(),
  lures: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  notes: z.string().optional(),
});

export const createAdventureSchema = z.object({
  coordinates: coordinatesSchema,
  locationName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  fishingDetails: fishingDetailsSchema.optional(),
  participants: z.array(z.string()).optional(),
  equipment: z.array(equipmentSchema).optional(),
  notes: z.string().optional(),
});

export const updateAdventureSchema = z.object({
  status: z.enum(["planned", "completed", "cancelled"]).optional(),
  coordinates: coordinatesSchema.optional(),
  locationName: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  fishingDetails: fishingDetailsSchema.optional(),
  participants: z.array(z.string()).optional(),
  equipment: z.array(equipmentSchema).optional(),
  catches: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
