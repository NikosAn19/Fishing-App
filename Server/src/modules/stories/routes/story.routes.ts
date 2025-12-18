import express from "express";
import { StoryController } from "../controllers/StoryController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { createStorySchema } from "../schemas/storySchema";
import { z } from "zod";

const router = express.Router();
const storyController = new StoryController();

// All story routes require authentication
router.use(requireAuth);

// @desc    Create new story
// @route   POST /api/stories
// @access  Private
router.post(
  "/",
  validateRequest(z.object({ body: createStorySchema })),
  storyController.createStory.bind(storyController)
);

// @desc    Get stories feed
// @route   GET /api/stories/feed
// @access  Private
router.get("/feed", storyController.getStoriesFeed.bind(storyController));

// @desc    Mark story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
router.post("/:id/view", storyController.viewStory.bind(storyController));

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
router.delete("/:id", storyController.deleteStory.bind(storyController));

export default router;
