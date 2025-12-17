import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { updateProfile, getProfile, searchUsers, getUserById } from "../controllers/userController";

const router = express.Router();

// @desc    Get user by ID (Public Profile)
// @route   GET /api/users/:id
// @access  Private
// Place this BEFORE generic routes if they conflict, but :id is distinct from 'profile'/'search' if check strictly
// However, 'search', 'profile', 'lookup' are specific words. 
// If :id matches 'profile', express might be confused if placed before.
// We should place this LAST to avoid matching 'profile' or 'search' as an ID.
router.get("/:id", requireAuth, getUserById);

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
router.get("/search", requireAuth, searchUsers);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", requireAuth, getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", requireAuth, updateProfile);

// @desc    Lookup user by Matrix ID
// @route   GET /api/users/lookup
// @access  Private
import { lookupUser } from "../controllers/userController";
router.get("/lookup", requireAuth, lookupUser);

export default router;


















