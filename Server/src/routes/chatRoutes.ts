import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as chatController from "../controllers/chatController";

const router = Router();

// POST /api/chat/direct
// Starts a direct chat with another user
router.post("/direct", requireAuth, chatController.startDirectChat);

// GET /api/chat/public
// Lists all public channels
router.get("/public", requireAuth, chatController.getPublicChannels);

// POST /api/chat/channel
// Creates a new public channel
router.post("/channel", requireAuth, chatController.createChannel);

// DELETE /api/chat/:roomId
// Deletes a room
router.delete("/:roomId", requireAuth, chatController.deleteRoom);

// PUT /api/chat/:roomId
// Updates room name/topic
router.put("/:roomId", requireAuth, chatController.updateRoom);

// POST /api/chat/:roomId/invite
// Invites a user to a room
router.post("/:roomId/invite", requireAuth, chatController.inviteUser);

export default router;
