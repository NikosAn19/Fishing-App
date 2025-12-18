import express from "express";
import { FavoriteSpotController } from "../controllers/FavoriteSpotController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { createFavoriteSpotSchema } from "../schemas/favoriteSpotSchema";
import { z } from "zod";

const router = express.Router();
const favoriteSpotController = new FavoriteSpotController();

// All favorite spot routes require authentication
router.use(requireAuth);

/**
 * @desc    Get user's favorite spots
 * @route   GET /api/favorite-spots
 * @access  Private
 */
router.get("/", favoriteSpotController.getFavoriteSpots.bind(favoriteSpotController));

/**
 * @desc    Add favorite spot
 * @route   POST /api/favorite-spots
 * @access  Private
 */
router.post(
  "/",
  validateRequest(z.object({ body: createFavoriteSpotSchema })),
  favoriteSpotController.addFavoriteSpot.bind(favoriteSpotController)
);

/**
 * @desc    Delete favorite spot
 * @route   DELETE /api/favorite-spots/:id
 * @access  Private
 */
router.delete("/:id", favoriteSpotController.deleteFavoriteSpot.bind(favoriteSpotController));

export default router;
