import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  createStory,
  getStoriesFeed,
  viewStory,
  deleteStory
} from '../controllers/storyController';

const router = Router();

router.use(requireAuth); // All story routes require authentication

router.post('/', createStory);
router.get('/feed', getStoriesFeed);
router.post('/:id/view', viewStory);
router.delete('/:id', deleteStory);

export default router;
