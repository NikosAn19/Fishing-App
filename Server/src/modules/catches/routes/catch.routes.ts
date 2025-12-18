import express from "express";
import { CatchController } from "../controllers/CatchController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { createCatchSchema, updateCatchSchema } from "../schemas/catchSchema";
import { z } from "zod";

const router = express.Router();
const catchController = new CatchController();

// @desc    Get all catches (filtered by current user)
// @route   GET /api/catches
// @access  Private
router.get("/", requireAuth, catchController.listCatches.bind(catchController));

// @desc    Create new catch
// @route   POST /api/catches
// @access  Private
router.post(
  "/",
  requireAuth,
  validateRequest(z.object({ body: createCatchSchema })),
  catchController.createCatch.bind(catchController)
);

// @desc    Get single catch
// @route   GET /api/catches/:id
// @access  Public (or Private if desired, keeping consistent with old logic)
router.get("/:id", catchController.getCatchById.bind(catchController));

// @desc    Update catch
// @route   PUT /api/catches/:id
// @access  Private
router.put(
  "/:id",
  requireAuth,
  validateRequest(z.object({ body: updateCatchSchema })),
  catchController.updateCatch.bind(catchController)
);

// @desc    Delete catch
// @route   DELETE /api/catches/:id
// @access  Private
router.delete("/:id", requireAuth, catchController.deleteCatch.bind(catchController));

export default router;
