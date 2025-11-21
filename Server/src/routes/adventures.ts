import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getAdventures,
  getAdventure,
  createAdventure,
  updateAdventure,
  deleteAdventure,
} from "../controllers/adventureController";

const router = express.Router();

// @desc    Get user's adventures
// @route   GET /api/adventures
// @access  Private
router.get("/", requireAuth, getAdventures);

// @desc    Get single adventure
// @route   GET /api/adventures/:id
// @access  Private
router.get("/:id", requireAuth, getAdventure);

// @desc    Create adventure
// @route   POST /api/adventures
// @access  Private
router.post("/", requireAuth, createAdventure);

// @desc    Update adventure
// @route   PUT /api/adventures/:id
// @access  Private
router.put("/:id", requireAuth, updateAdventure);

// @desc    Delete adventure
// @route   DELETE /api/adventures/:id
// @access  Private
router.delete("/:id", requireAuth, deleteAdventure);

export default router;

