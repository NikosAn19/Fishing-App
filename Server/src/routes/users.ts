import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { updateProfile, getProfile } from "../controllers/userController";

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", requireAuth, getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", requireAuth, updateProfile);

export default router;


















