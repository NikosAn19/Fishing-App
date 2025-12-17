import express from 'express';
import UserModel from '../models/User';
import { requireAuth } from '../middleware/requireAuth';
import { NotificationService } from '../services/NotificationService';
import { NotificationType } from '../types/NotificationTypes';
import { NotificationMessage } from '../types/NotificationMessages';

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

console.log(`[FriendRoutes] Module Loaded at ${new Date().toISOString()}`);

// Send Friend Request (by User ID)
router.post('/request', requireAuth, async (req: any, res) => {
  console.log('[FriendRequest] Received Body:', JSON.stringify(req.body));
  
  // Defensive: Trim string
  const rawTargetId = req.body.targetUserId;
  const targetUserId = (typeof rawTargetId === 'string') ? rawTargetId.trim() : rawTargetId;
  const requesterId = req.user._id;

  console.log(`[FriendRequest] Processing: '${targetUserId}' (Original: '${rawTargetId}')`);

  if (targetUserId === requesterId.toString()) {
    res.status(400).json({ message: 'Cannot add yourself' });
    return;
  }

  try {
    let targetUser = null;
    
    // Check if input is a Matrix ID
    if (targetUserId.startsWith('@')) {
        console.log(`[FriendRequest] Looking up Matrix ID: ${targetUserId}`);
        targetUser = await UserModel.findOne({ 'matrix.userId': targetUserId });
    } else {
        // Assume MongoDB ID
        if (!targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error(`[FriendRequest] Invalid ID format: '${targetUserId}'`);
            res.status(400).json({ message: 'Invalid User ID format' });
            return;
        }
        targetUser = await UserModel.findById(targetUserId);
    }

    console.log('[FriendRequest] Target User Found:', targetUser ? targetUser._id : 'NO');

    const requester = await UserModel.findById(requesterId);

    if (!targetUser || !requester) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Reverse Check: Did target already request us?
    const reverseExisting = requester.friends.find((f: any) => f.user.toString() === targetUserId.toString());
    
    if (reverseExisting) {
        if (reverseExisting.status === 'pending') {
             res.status(409).json({ message: 'This user has already sent you a friend request. Please check your notifications to accept it.' });
             return;
        }
        if (reverseExisting.status === 'accepted') {
             res.status(409).json({ message: 'You are already friends!' });
             return;
        }
    }

    // Check if already friends or pending
    const existing = targetUser.friends.find((f: any) => f.user.toString() === requesterId.toString());
    if (existing) {
      res.status(409).json({ message: 'Request already sent or users are already friends' });
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
      const body = NotificationMessage.FRIEND_REQUEST_BODY.replace('{name}', requester.displayName || 'Someone');
      
      await NotificationService.sendPushNotification(
        targetUser.pushToken,
        NotificationMessage.FRIEND_REQUEST_TITLE,
        body,
        {
           type: NotificationType.FRIEND_REQUEST,
           requesterId: requester._id.toString(),
           requesterName: requester.displayName || 'Someone',
           avatarUrl: requester.avatarUrl 
        }
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

// Reject Friend Request
router.post('/reject', requireAuth, async (req: any, res) => {
    const { requesterId } = req.body;
    const userId = req.user._id;
  
    try {
      const user = await UserModel.findById(userId);
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // Find and remove the friend request
      const initialLength = user.friends.length;
      user.friends = user.friends.filter(f => f.user.toString() !== requesterId);
      
      if (user.friends.length === initialLength) {
          res.status(404).json({ message: 'Friend request not found' });
          return;
      }

      await user.save();
  
      res.json({ message: 'Friend request rejected' });
    } catch (error) {
      res.status(500).json({ message: 'Error rejecting friend request', error });
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
