import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import ChatRoom from "../models/ChatRoom";
import { MatrixRoomService } from "../services/matrix/MatrixRoomService";

const matrixRoomService = new MatrixRoomService();

export async function startDirectChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { recipientId } = req.body;
    const currentUser = req.user;

    if (!currentUser || !currentUser.matrix?.userId) {
      return res.status(400).json({
        success: false,
        error: "Current user does not have a Matrix account linked.",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.matrix?.userId) {
      return res.status(404).json({
        success: false,
        error: "Recipient not found or does not have a Matrix account.",
      });
    }

    // Check if a chat already exists in our MongoDB
    const existingChat = await ChatRoom.findOne({
      type: 'direct',
      participants: { $all: [currentUser._id, recipient._id] }
    });

    if (existingChat) {
      return res.json({
        success: true,
        roomId: existingChat.matrixRoomId,
      });
    }

    const roomId = await matrixRoomService.createDirectRoom(
      currentUser.matrix.userId,
      recipient.matrix.userId
    );

    if (!roomId) {
      return res.status(500).json({
        success: false,
        error: "Failed to create Matrix room.",
      });
    }

    // Save to MongoDB
    await ChatRoom.create({
      matrixRoomId: roomId,
      type: 'direct',
      participants: [currentUser._id, recipient._id],
      createdBy: currentUser._id,
    });

    return res.json({
      success: true,
      roomId,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createChannel(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, topic } = req.body;
    const currentUser = req.user;

    if (!currentUser || !currentUser.matrix?.userId) {
      return res.status(400).json({
        success: false,
        error: "Current user does not have a Matrix account linked.",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Channel name is required.",
      });
    }

    const roomId = await matrixRoomService.createPublicRoom(
      currentUser.matrix.userId,
      name,
      topic
    );

    if (!roomId) {
      return res.status(500).json({
        success: false,
        error: "Failed to create public channel.",
      });
    }

    // Save to MongoDB
    await ChatRoom.create({
      matrixRoomId: roomId,
      type: 'public',
      participants: [currentUser._id], // Creator is the first participant
      name,
      topic,
      createdBy: currentUser._id,
    });

    return res.json({
      success: true,
      roomId,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;

    if (!roomId) {
        return res.status(400).json({ success: false, error: "Room ID is required" });
    }
    
    // Delete from Matrix
    const success = await matrixRoomService.deleteRoom(roomId);
    if (!success) {
        return res.status(500).json({ success: false, error: "Failed to delete room from Matrix" });
    }

    // Delete from MongoDB
    await ChatRoom.deleteOne({ matrixRoomId: roomId });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
        return res.status(400).json({ success: false, error: "Room ID is required" });
    }
    const { name, topic } = req.body;
    const currentUser = req.user;

    const matrixUserId = currentUser?.matrix?.userId;

    if (!matrixUserId) {
        return res.status(400).json({ success: false, error: "User not linked to Matrix" });
    }

    // Update Matrix
    const success = await matrixRoomService.updateRoom(roomId, matrixUserId as string, name, topic);
    if (!success) {
        return res.status(500).json({ success: false, error: "Failed to update Matrix room" });
    }

    // Update MongoDB
    const updateData: any = {};
    if (name) updateData.name = name;
    if (topic) updateData.topic = topic;

    await ChatRoom.updateOne({ matrixRoomId: roomId }, updateData);

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
        return res.status(400).json({ success: false, error: "Room ID is required" });
    }
    const { userId } = req.body; // Our DB User ID

    const userToInvite = await User.findById(userId);
    if (!userToInvite?.matrix?.userId) {
        return res.status(404).json({ success: false, error: "User not found or no Matrix account" });
    }

    // Invite in Matrix
    const success = await matrixRoomService.inviteUser(roomId, userToInvite.matrix.userId);
    if (!success) {
        return res.status(500).json({ success: false, error: "Failed to invite user to Matrix room" });
    }

    // Update MongoDB participants
    await ChatRoom.updateOne(
        { matrixRoomId: roomId },
        { $addToSet: { participants: userId } }
    );

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicChannels(req: Request, res: Response, next: NextFunction) {
  try {
    const channels = await ChatRoom.find({ type: 'public' })
      .select('matrixRoomId name topic slug region_code participants')
      .sort({ name: 1 });

    return res.json({
      success: true,
      channels,
    });
  } catch (error) {
    return next(error);
  }
}
