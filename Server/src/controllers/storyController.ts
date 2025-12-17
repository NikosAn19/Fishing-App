import { Request, Response } from 'express';
import Story from '../models/Story';
import { z } from 'zod';
import mongoose from 'mongoose';
import User from '../models/User';

const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']).default('image'),
  duration: z.number().optional().default(5000),
});

export const createStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { mediaUrl, mediaType, duration } = createStorySchema.parse(req.body);

    // Expire in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      user: userId,
      mediaUrl,
      mediaType,
      duration,
      expiresAt,
    });

    res.status(201).json(story);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      console.error('Create story error:', error);
      res.status(500).json({ error: 'Failed to create story' });
    }
  }
};

export const getStoriesFeed = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!._id;

    // TODO: Filter by friends only. For now, showing ALL stories + user's own stories.
    // Ideally: const friends = await getFriendIds(currentUserId);
    // stories: { user: { $in: [...friends, currentUserId] } }
    
    // Aggregate stories
    const feed = await Story.aggregate([
      // 1. Filter visible stories (not expired)
      { $match: { expiresAt: { $gt: new Date() } } },
      
      // 2. Sort by newest
      { $sort: { createdAt: -1 } },
      
      // 3. Group by user
      {
        $group: {
          _id: '$user',
          stories: { $push: '$$ROOT' },
          latestStoryAt: { $max: '$createdAt' }
        }
      },
      
      // 4. Lookup user details
      {
        $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      
      // 5. Format output
      {
        $project: {
            userId: '$_id',
            username: '$userInfo.displayName',
            userImage: '$userInfo.avatarUrl', // Ensure this field matches User model
            stories: 1,
            latestStoryAt: 1,
            // Check if ALL stories are viewed by me
            allViewed: {
                $allElementsTrue: {
                    $map: {
                        input: '$stories',
                        as: 'story',
                        in: { $in: [new mongoose.Types.ObjectId(currentUserId), { $ifNull: ['$$story.views.user', []] }] }
                    }
                }
            }
        }
      },
      
      // 6. Sort users (Own user first, then by latest story)
      {
          $addFields: {
              isMe: { $eq: ['$userId', new mongoose.Types.ObjectId(currentUserId)] }
          }
      },
      { $sort: { isMe: -1, latestStoryAt: -1 } }
    ]);

    res.json(feed);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get stories feed' });
  }
};

export const viewStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    await Story.findByIdAndUpdate(id, {
      $addToSet: {
        views: {
          user: userId,
          viewedAt: new Date()
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark story as viewed' });
  }
};

export const deleteStory = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const { id } = req.params;
        
        const result = await Story.deleteOne({ _id: id, user: userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Story not found or unauthorized' });
        }
        
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete story' });
    }
};
