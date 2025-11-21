import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getFavoriteSpots,
  addFavoriteSpot,
  deleteFavoriteSpot,
} from "../controllers/favoriteSpotController";
import { z } from "zod";

const router = express.Router();

const validateCreate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      address: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
    });

    const parsed = schema.parse(req.body);
    req.body = parsed;
    return next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error?.errors?.[0]?.message ?? "Invalid request payload",
    });
  }
};

// @desc    Get user's favorite spots
// @route   GET /api/favorite-spots
// @access  Private
router.get("/", requireAuth, getFavoriteSpots);

// @desc    Add favorite spot
// @route   POST /api/favorite-spots
// @access  Private
router.post("/", requireAuth, validateCreate, addFavoriteSpot);

// @desc    Delete favorite spot
// @route   DELETE /api/favorite-spots/:id
// @access  Private
router.delete("/:id", requireAuth, deleteFavoriteSpot);

export default router;
