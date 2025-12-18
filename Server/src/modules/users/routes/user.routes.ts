import express from "express";
import { UserController } from "../controllers/UserController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { updateProfileSchema, searchUsersSchema, lookupUserSchema, pushTokenSchema } from "../schemas/userSchema";
import { z } from "zod";

const router = express.Router();
const userController = new UserController();

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  "/profile",
  requireAuth,
  validateRequest(z.object({ body: updateProfileSchema })),
  userController.updateProfile.bind(userController)
);

// @desc    Get user profile (self)
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", requireAuth, userController.getProfile.bind(userController));

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
router.get(
  "/search",
  requireAuth,
  validateRequest(z.object({ query: searchUsersSchema })),
  userController.searchUsers.bind(userController)
);

// @desc    Lookup user by Matrix ID
// @route   GET /api/users/lookup
// @access  Private
router.get(
  "/lookup",
  requireAuth,
  validateRequest(z.object({ query: lookupUserSchema })),
  userController.lookupUser.bind(userController)
);

// @desc    Get user by ID (Public Profile)
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", requireAuth, userController.getUserById.bind(userController));

// @desc    Register push token
// @route   POST /api/users/push-token
// @access  Private
router.post(
  "/push-token",
  requireAuth,
  validateRequest(z.object({ body: pushTokenSchema })),
  userController.updatePushToken.bind(userController)
);

export default router;
