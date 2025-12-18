import UserModel from "../../../models/User";
import { NotificationService } from "../../notifications/services/NotificationService";
import { NotificationType } from "../../notifications/types/NotificationTypes";
import { NotificationMessage } from "../../notifications/constants/NotificationMessages";
import { AppError } from "../../../middleware/error/AppError";
import mongoose from "mongoose";

export class FriendService {
  public async getFriendsList(userId: string) {
    const user = await UserModel.findById(userId).populate(
      "friends.user",
      "displayName avatarUrl email"
    );
    if (!user) throw new AppError("User not found", 404);

    return user.friends.map((f: any) => ({
      id: f.user._id,
      displayName: f.user.displayName,
      avatarUrl: f.user.avatarUrl,
      status: f.status,
    }));
  }

  public async sendFriendRequest(requesterId: string, targetUserId: string) {
    if (requesterId === targetUserId) {
      throw new AppError("Cannot add yourself", 400);
    }

    let targetUser = null;

    // Check if input is a Matrix ID
    if (targetUserId.startsWith("@")) {
      targetUser = await UserModel.findOne({ "matrix.userId": targetUserId });
    } else {
      // Assume MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new AppError("Invalid User ID format", 400);
      }
      targetUser = await UserModel.findById(targetUserId);
    }

    if (!targetUser) throw new AppError("Target user not found", 404);

    const requester = await UserModel.findById(requesterId);
    if (!requester) throw new AppError("Requester not found", 404);

    // Reverse Check: Did target already request us?
    const reverseExisting = requester.friends.find(
      (f: any) => f.user.toString() === targetUser!._id.toString()
    );

    if (reverseExisting) {
      if (reverseExisting.status === "pending") {
        throw new AppError(
          "This user has already sent you a friend request. Please check your notifications to accept it.",
          409
        );
      }
      if (reverseExisting.status === "accepted") {
        throw new AppError("You are already friends!", 409);
      }
    }

    // Check if already friends or pending
    const existing = targetUser.friends.find(
      (f: any) => f.user.toString() === requesterId
    );
    if (existing) {
      throw new AppError(
        "Request already sent or users are already friends",
        409
      );
    }

    // Add to target user's list (pending)
    targetUser.friends.push({
      user: requesterId as any,
      status: "pending",
      createdAt: new Date(),
    });
    await targetUser.save();

    // Send Push Notification
    if (targetUser.pushToken) {
      const body = NotificationMessage.FRIEND_REQUEST_BODY.replace(
        "{name}",
        requester.displayName || "Someone"
      );

      await NotificationService.sendPushNotification(
        targetUser.pushToken,
        NotificationMessage.FRIEND_REQUEST_TITLE,
        body,
        {
          type: NotificationType.FRIEND_REQUEST,
          requesterId: requester._id.toString(),
          requesterName: requester.displayName || "Someone",
          avatarUrl: requester.avatarUrl,
        }
      );
    }

    return { message: "Friend request sent" };
  }

  public async acceptFriendRequest(userId: string, requesterId: string) {
    const user = await UserModel.findById(userId);
    const requester = await UserModel.findById(requesterId);

    if (!user || !requester) throw new AppError("User not found", 404);

    // Update status for user
    const friendEntry = user.friends.find(
      (f) => f.user.toString() === requesterId
    );
    if (!friendEntry) throw new AppError("Friend request not found", 404);
    
    friendEntry.status = "accepted";
    await user.save();

    // Add user to requester's list (accepted)
    const existing = requester.friends.find(
      (f) => f.user.toString() === userId
    );
    if (!existing) {
      requester.friends.push({
        user: userId as any,
        status: "accepted",
        createdAt: new Date(),
      });
    } else {
      existing.status = "accepted";
    }
    await requester.save();

    // Notify requester
    if (requester.pushToken) {
      await NotificationService.sendPushNotification(
        requester.pushToken,
        "Friend Request Accepted",
        `${user.displayName} accepted your friend request!`
      );
    }

    return { message: "Friend request accepted" };
  }

  public async rejectFriendRequest(userId: string, requesterId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const initialLength = user.friends.length;
    user.friends = user.friends.filter((f) => f.user.toString() !== requesterId);

    if (user.friends.length === initialLength) {
      throw new AppError("Friend request not found", 404);
    }

    await user.save();
    return { message: "Friend request rejected" };
  }
}
