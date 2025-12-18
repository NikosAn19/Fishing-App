import express from "express";
import { AdventureController } from "../controllers/AdventureController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { createAdventureSchema, updateAdventureSchema } from "../schemas/adventureSchema";
import { z } from "zod";

const router = express.Router();
const adventureController = new AdventureController();

// All adventure routes require authentication
router.use(requireAuth);

/**
 * @desc    Get user's adventures
 * @route   GET /api/adventures
 * @access  Private
 */
router.get("/", adventureController.getAdventures.bind(adventureController));

/**
 * @desc    Get single adventure
 * @route   GET /api/adventures/:id
 * @access  Private
 */
router.get("/:id", adventureController.getAdventure.bind(adventureController));

/**
 * @desc    Create adventure
 * @route   POST /api/adventures
 * @access  Private
 */
router.post(
  "/",
  validateRequest(z.object({ body: createAdventureSchema })),
  adventureController.createAdventure.bind(adventureController)
);

/**
 * @desc    Update adventure
 * @route   PUT /api/adventures/:id
 * @access  Private
 */
router.put(
  "/:id",
  validateRequest(z.object({ body: updateAdventureSchema })),
  adventureController.updateAdventure.bind(adventureController)
);

/**
 * @desc    Delete adventure
 * @route   DELETE /api/adventures/:id
 * @access  Private
 */
router.delete("/:id", adventureController.deleteAdventure.bind(adventureController));

export default router;
