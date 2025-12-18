import { z } from "zod";

export const photoSchema = z
  .object({
    assetId: z.string().optional(),
    key: z.string().min(1),
    url: z.string().url(),
    contentType: z.string().optional(),
    size: z.number().int().nonnegative().optional(),
  })
  .optional();

export const spotSchema = z
  .object({
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    name: z.string().optional(),
  })
  .optional();

const baseCatchSchema = z.object({
  species: z.string().min(1).optional(),
  fishType: z.string().min(1).optional(), // temporary for transition
  weight: z.number().positive().nullable().optional(),
  length: z.number().positive().nullable().optional(),
  notes: z.string().max(1000).optional(),
  photo: photoSchema,
  spot: spotSchema,
  capturedAt: z.union([z.string().datetime(), z.number().int()]).optional(),
});

export const createCatchSchema = baseCatchSchema.refine(
  (v) => !!(v.species || v.fishType),
  { message: "species or fishType is required" }
);

export const updateCatchSchema = baseCatchSchema.partial();
