import UserModel, { UserDoc } from "../../../models/User";
import AssetModel from "../../../models/Asset";
import { extractKeyFromUrl, deleteObject } from "../../../utils/s3";
import { AppError } from "../../../middleware/error/AppError";

export class UserService {
  public sanitizeUser(user: UserDoc) {
    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      providers: {
        email: Boolean(user.passwordHash),
        google: Boolean(user.googleId),
      },
      matrix: user.matrix
        ? {
            userId: user.matrix.userId,
            isSynced: user.matrix.isSynced,
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.sanitizeUser(user);
  }

  public async updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string }) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Delete old avatar if updating to a new one
    if (data.avatarUrl !== undefined && data.avatarUrl !== user.avatarUrl) {
      const oldAvatarUrl = user.avatarUrl;
      if (oldAvatarUrl) {
        const oldKey = extractKeyFromUrl(oldAvatarUrl);
        if (oldKey) {
          // Non-blocking cleanup
          (async () => {
            try {
              const deleted = await deleteObject(oldKey);
              if (deleted) {
                await AssetModel.deleteOne({ key: oldKey });
              }
            } catch (error) {
              console.warn("Failed to delete old avatar (non-blocking):", error);
            }
          })();
        }
      }
    }

    if (data.displayName !== undefined) {
      user.displayName = data.displayName;
    }
    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    await user.save();
    return this.sanitizeUser(user);
  }

  public async getUserById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("Invalid User ID format", 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.sanitizeUser(user);
  }

  public async lookupUserByMatrixId(matrixId: string) {
    const user = await UserModel.findOne({ "matrix.userId": matrixId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.sanitizeUser(user);
  }

  public async searchUsers(query: string, currentUserId: string) {
    const users = await UserModel.find({
      $or: [
        { displayName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: currentUserId },
    })
      .select("displayName email avatarUrl")
      .limit(10);

    return users.map((u) => ({
      id: u._id,
      displayName: u.displayName,
      email: u.email,
      avatarUrl: u.avatarUrl,
    }));
  }

  public async updatePushToken(userId: string, token: string) {
    await UserModel.findByIdAndUpdate(userId, { pushToken: token });
    return { success: true };
  }
}
