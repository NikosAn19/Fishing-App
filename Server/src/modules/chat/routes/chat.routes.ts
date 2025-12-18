import express from "express";
import { ChatController } from "../controllers/ChatController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { 
  startDirectChatSchema, 
  createChannelSchema, 
  updateRoomSchema, 
  inviteUserSchema 
} from "../schemas/chatSchema";
import { z } from "zod";

const router = express.Router();
const chatController = new ChatController();

// All chat routes require authentication
router.use(requireAuth);

/**
 * @desc    Starts a direct chat with another user
 * @route   POST /api/chat/direct
 * @access  Private
 */
router.post(
  "/direct", 
  validateRequest(z.object({ body: startDirectChatSchema })),
  chatController.startDirectChat.bind(chatController)
);

/**
 * @desc    Lists all public channels
 * @route   GET /api/chat/public
 * @access  Private
 */
router.get("/public", chatController.getPublicChannels.bind(chatController));

/**
 * @desc    Creates a new public channel
 * @route   POST /api/chat/channel
 * @access  Private
 */
router.post(
  "/channel", 
  validateRequest(z.object({ body: createChannelSchema })),
  chatController.createChannel.bind(chatController)
);

/**
 * @desc    Deletes a room
 * @route   DELETE /api/chat/:roomId
 * @access  Private
 */
router.delete("/:roomId", chatController.deleteRoom.bind(chatController));

/**
 * @desc    Updates room name/topic
 * @route   PUT /api/chat/:roomId
 * @access  Private
 */
router.put(
  "/:roomId", 
  validateRequest(z.object({ body: updateRoomSchema })),
  chatController.updateRoom.bind(chatController)
);

/**
 * @desc    Invites a user to a room
 * @route   POST /api/chat/:roomId/invite
 * @access  Private
 */
router.post(
  "/:roomId/invite", 
  validateRequest(z.object({ body: inviteUserSchema })),
  chatController.inviteUser.bind(chatController)
);

export default router;
