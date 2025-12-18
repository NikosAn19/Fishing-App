import StoryModel from "../../../models/Story";
import { AppError } from "../../../middleware/error/AppError";
import mongoose from "mongoose";

export class StoryService {
  public async createStory(userId: string, data: { mediaUrl: string; mediaType?: 'image' | 'video'; duration?: number }) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const story = await StoryModel.create({
      user: userId,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || 'image',
      duration: data.duration || 5000,
      expiresAt,
    });

    return story;
  }

  public async getStoriesFeed(currentUserId: string) {
    // Complex aggregation pipeline for stories feed
    const feed = await StoryModel.aggregate([
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
            userImage: '$userInfo.avatarUrl',
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
      
      // 6. Sort users (Own user first, then UNSEEN stories first, then by latest story)
      {
          $addFields: {
              isMe: { $eq: ['$userId', new mongoose.Types.ObjectId(currentUserId)] }
          }
      },
      { 
          $sort: { 
              isMe: -1,       // 1. My story first
              allViewed: 1,   // 2. Unseen stories (false=0) before seen stories (true=1)
              latestStoryAt: -1 // 3. Newest stories first
          } 
      }
    ]);

    return feed;
  }

  public async viewStory(userId: string, storyId: string) {
    const result = await StoryModel.findByIdAndUpdate(storyId, {
      $addToSet: {
        views: {
          user: userId,
          viewedAt: new Date()
        }
      }
    });

    if (!result) throw new AppError("Story not found", 404);
    return { success: true };
  }

  public async deleteStory(userId: string, storyId: string) {
    const result = await StoryModel.deleteOne({ _id: storyId, user: userId });
    
    if (result.deletedCount === 0) {
      throw new AppError("Story not found or unauthorized", 404);
    }
    
    return { success: true };
  }
}
