import express from "express";
import { FriendController } from "../controllers/FriendController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { friendRequestSchema, acceptFriendRequestSchema, rejectFriendRequestSchema } from "../schemas/friendSchema";
import { z } from "zod";

const router = express.Router();
const friendController = new FriendController();

// All friend routes require authentication
router.use(requireAuth);

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
router.get("/", friendController.getFriendsList.bind(friendController));

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
router.post(
  "/request",
  validateRequest(z.object({ body: friendRequestSchema })),
  friendController.sendFriendRequest.bind(friendController)
);

// @desc    Accept friend request
// @route   POST /api/friends/accept
// @access  Private
router.post(
  "/accept",
  validateRequest(z.object({ body: acceptFriendRequestSchema })),
  friendController.acceptFriendRequest.bind(friendController)
);

// @desc    Reject friend request
// @route   POST /api/friends/reject
// @access  Private
router.post(
  "/reject",
  validateRequest(z.object({ body: rejectFriendRequestSchema })),
  friendController.rejectFriendRequest.bind(friendController)
);

export default router;
