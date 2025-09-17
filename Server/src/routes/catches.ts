// src/routes/catches.ts
import express from "express";
import { z } from "zod";
import CatchModel from "../models/Catch";
import { headObject } from "../utils/s3"; // προαιρετικό: έλεγχος ύπαρξης στο R2

const router = express.Router();

// Αν έχεις auth middleware που βάζει user στο req
function getUserId(req: express.Request): string | undefined {
  // π.χ. return (req as any).user?.id;
  return undefined;
}

// Προσθήκη στην αρχή του αρχείου
const CDN_BASE = process.env.CDN_BASE || 'https://pub-6152823702fd4064a507eac85c165f45.r2.dev';

function fixPhotoUrl(photo: any) {
  if (!photo) return photo;
  
  const fixed = { ...photo };
  
  // Αν έχουμε key, χτίσε σωστό URL με CDN
  if (fixed.key && CDN_BASE) {
    const cleanKey = fixed.key.replace(/^\/+/, ''); // αφαίρεση leading slashes
    fixed.url = `${CDN_BASE.replace(/\/+$/, '')}/${cleanKey}`;
    console.log(`🔧 Fixed photo URL: ${fixed.url}`);
  }
  
  return fixed;
}

function toDTO(doc: any) {
  return {
    id: String(doc._id),
    species: doc.species,
    weight: doc.weight,
    length: doc.length,
    notes: doc.notes,
    photo: fixPhotoUrl(doc.photo), // Διόρθωση του photo URL
    spot: doc.spot,
    capturedAt: doc.capturedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId: doc.userId ? String(doc.userId) : undefined,
  };
};


const photoSchema = z
  .object({
    assetId: z.string().optional(),
    key: z.string().min(1),
    url: z.string().url(),
    contentType: z.string().optional(),
    size: z.number().int().nonnegative().optional(),
  })
  .optional();

const spotSchema = z
  .object({
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    name: z.string().optional(),
  })
  .optional();

// Δέχεται species ΚΑΙ/Ή fishType (temporary), canonical → species
const baseCreate = z.object({
  species: z.string().min(1).optional(),
  fishType: z.string().min(1).optional(),
  weight: z.number().positive().nullable().optional(),
  length: z.number().positive().nullable().optional(),
  notes: z.string().max(1000).optional(),
  photo: photoSchema,
  spot: spotSchema,
  capturedAt: z.union([z.string().datetime(), z.number().int()]).optional(), // ISO ή unix ms
});
const createSchema = baseCreate.refine(
  (v) => !!(v.species || v.fishType),
  { message: "species is required" }
);

const updateSchema = baseCreate.partial();

/** GET /api/catches?limit=&page= */
router.get("/", async (req, res, next): Promise<void> => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const userId = getUserId(req);

    const q: any = {};
    if (userId) q.userId = userId;

    const [items, total] = await Promise.all([
      CatchModel.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CatchModel.countDocuments(q),
    ]);

    res.json({ page, limit, total, items: items.map(toDTO) });
  } catch (err) {
    next(err);
  }
});

/** POST /api/catches */
router.post("/", async (req, res, next): Promise<void> => {
  try {
    console.log("🎣 POST /api/catches - Received request");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
    
    const body = createSchema.parse(req.body);
    const species = (body.species ?? body.fishType)!.trim();
    console.log("🐟 Parsed species:", species);

    // Optional: επιβεβαίωση ότι το αρχείο υπάρχει στο R2
    if (process.env.VERIFY_UPLOADS === "true" && body.photo?.key) {
      try {
        await headObject(body.photo.key);
      } catch {
        res.status(400).json({ error: "Uploaded file not found in storage" });
        return;
      }
    }

    const userId = getUserId(req);
    const capturedAt =
      typeof body.capturedAt === "string" || typeof body.capturedAt === "number"
        ? new Date(body.capturedAt)
        : null;

    const catchData = {
      userId,
      species,
      weight:
        typeof body.weight === "number"
          ? Number(body.weight.toFixed(3))
          : body.weight ?? null,
      length:
        typeof body.length === "number"
          ? Number(body.length.toFixed(1))
          : body.length ?? null,
      notes: body.notes,
      photo: body.photo,
      spot: body.spot,
      capturedAt,
    };
    
    console.log("💾 Creating catch with data:", JSON.stringify(catchData, null, 2));
    const doc = await CatchModel.create(catchData);
    console.log("✅ Catch created successfully:", doc._id);

    res.status(201).json(toDTO(doc));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    next(err);
  }
});

/** GET /api/catches/:id */
router.get("/:id", async (req, res, next): Promise<void> => {
  try {
    const doc = await CatchModel.findById(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(toDTO(doc));
  } catch (err) {
    next(err);
  }
});

/** PUT /api/catches/:id */
router.put("/:id", async (req, res, next): Promise<void> => {
  try {
    const body = updateSchema.parse(req.body);
    const updates: any = { ...body };

    // normalize fishType → species αν χρειαστεί
    if (!updates.species && updates.fishType) {
      updates.species = updates.fishType;
      delete updates.fishType;
    }

    if (typeof body.capturedAt === "string" || typeof body.capturedAt === "number") {
      updates.capturedAt = new Date(body.capturedAt);
    }

    const doc = await CatchModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!doc) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(toDTO(doc));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    next(err);
  }
});

/** DELETE /api/catches/:id */
router.delete("/:id", async (req, res, next): Promise<void> => {
  try {
    const doc = await CatchModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;




