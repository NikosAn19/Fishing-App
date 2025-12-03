import express from 'express';
import UserModel from '../models/User';
import { requireAuth } from '../middleware/requireAuth';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

// Get Friends List
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = await UserModel.findById(req.user._id).populate('friends.user', 'displayName avatarUrl email');
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    // Transform to a cleaner format
    const friends = user.friends.map(f => ({
      id: (f.user as any)._id,
      displayName: (f.user as any).displayName,
      avatarUrl: (f.user as any).avatarUrl,
      status: f.status,
    }));

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends', error });
  }
});

// Send Friend Request (by User ID)
router.post('/request', requireAuth, async (req: any, res) => {
  const { targetUserId } = req.body;
  const requesterId = req.user._id;

  if (targetUserId === requesterId.toString()) {
    res.status(400).json({ message: 'Cannot add yourself' });
    return;
  }

  try {
    const targetUser = await UserModel.findById(targetUserId);
    const requester = await UserModel.findById(requesterId);

    if (!targetUser || !requester) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already friends or pending
    const existing = targetUser.friends.find(f => f.user.toString() === requesterId.toString());
    if (existing) {
      res.status(400).json({ message: 'Request already sent or users are already friends' });
      return;
    }

    // Add to target user's list (pending)
    targetUser.friends.push({
      user: requesterId as any,
      status: 'pending',
      createdAt: new Date()
    });
    await targetUser.save();

    // Send Push Notification
    if (targetUser.pushToken) {
      await NotificationService.sendPushNotification(
        targetUser.pushToken,
        'New Friend Request',
        `${requester.displayName || 'Someone'} wants to be your friend!`
      );
    }

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error });
  }
});

// Accept Friend Request
router.post('/accept', requireAuth, async (req: any, res) => {
  const { requesterId } = req.body;
  const userId = req.user._id;

  try {
    const user = await UserModel.findById(userId);
    const requester = await UserModel.findById(requesterId);

    if (!user || !requester) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update status for user
    const friendEntry = user.friends.find(f => f.user.toString() === requesterId);
    if (!friendEntry) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }
    friendEntry.status = 'accepted';
    await user.save();

    // Add user to requester's list (accepted)
    // Check if already there (edge case)
    const existing = requester.friends.find(f => f.user.toString() === userId.toString());
    if (!existing) {
        requester.friends.push({
            user: userId as any,
            status: 'accepted',
            createdAt: new Date()
        });
        await requester.save();
    } else {
        existing.status = 'accepted';
        await requester.save();
    }

    // Notify requester
    if (requester.pushToken) {
        await NotificationService.sendPushNotification(
          requester.pushToken,
          'Friend Request Accepted',
          `${user.displayName} accepted your friend request!`
        );
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error });
  }
});

// Register Push Token
router.post('/push-token', requireAuth, async (req: any, res) => {
    const { token } = req.body;
    try {
        await UserModel.findByIdAndUpdate(req.user._id, { pushToken: token });
        res.json({ message: 'Push token updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating push token', error });
    }
});

export default router;
