import { Request, Response, NextFunction } from "express";
import UserModel, { UserDoc } from "../models/User";
import AssetModel from "../models/Asset";
import { z } from "zod";
import { extractKeyFromUrl, deleteObject } from "../utils/s3";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

function sanitizeUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    providers: {
      email: Boolean(user.passwordHash),
      google: Boolean(user.googleId),
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const body = updateProfileSchema.parse(req.body);
    const userId = req.user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Delete old avatar if updating to a new one
    if (body.avatarUrl !== undefined && body.avatarUrl !== user.avatarUrl) {
      const oldAvatarUrl = user.avatarUrl;
      if (oldAvatarUrl) {
        // Extract key from old avatar URL
        const oldKey = extractKeyFromUrl(oldAvatarUrl);
        if (oldKey) {
          // Delete old avatar from R2 and MongoDB (non-blocking)
          (async () => {
            try {
              // Delete from R2
              const deleted = await deleteObject(oldKey);
              if (deleted) {
                // Delete Asset record from MongoDB
                await AssetModel.deleteOne({ key: oldKey });
                console.log("✅ Old avatar and asset record deleted:", oldKey);
              }
            } catch (error) {
              console.warn(
                "❌ Failed to delete old avatar (non-blocking):",
                error
              );
              // Don't throw - this is fire-and-forget
            }
          })();
        } else {
          console.warn(
            "⚠️ Could not extract key from old avatar URL:",
            oldAvatarUrl
          );
        }
      }
    }

    // Update fields
    if (body.displayName !== undefined) {
      user.displayName = body.displayName;
    }
    if (body.avatarUrl !== undefined) {
      user.avatarUrl = body.avatarUrl;
    }

    await user.save();

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0]?.message || "Invalid request",
      });
    }
    return next(error);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}
