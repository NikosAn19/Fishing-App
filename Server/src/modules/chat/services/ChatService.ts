import User from "../../../models/User";
import ChatRoom from "../models/ChatRoom";
import { MatrixRoomService } from "./matrix/MatrixRoomService";
import { AppError } from "../../../middleware/error/AppError";

export class ChatService {
  private matrixRoomService: MatrixRoomService;

  constructor() {
    this.matrixRoomService = new MatrixRoomService();
  }

  public async startDirectChat(requesterId: string, recipientId: string) {
    const currentUser = await User.findById(requesterId);
    if (!currentUser || !currentUser.matrix?.userId) {
      throw new AppError("Current user does not have a Matrix account linked.", 400);
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.matrix?.userId) {
      throw new AppError("Recipient not found or does not have a Matrix account.", 404);
    }

    // Check if a chat already exists in our MongoDB
    const existingChat = await ChatRoom.findOne({
      type: "direct",
      participants: { $all: [currentUser._id, recipient._id] },
    });

    if (existingChat) {
      return { roomId: existingChat.matrixRoomId };
    }

    const roomId = await this.matrixRoomService.createDirectRoom(
      currentUser.matrix.userId,
      recipient.matrix.userId
    );

    if (!roomId) {
      throw new AppError("Failed to create Matrix room.", 500);
    }

    // Save to MongoDB
    await ChatRoom.create({
      matrixRoomId: roomId,
      type: "direct",
      participants: [currentUser._id, recipient._id],
      createdBy: currentUser._id,
    });

    return { roomId };
  }

  public async createChannel(requesterId: string, name: string, topic?: string) {
    const currentUser = await User.findById(requesterId);
    if (!currentUser || !currentUser.matrix?.userId) {
      throw new AppError("Current user does not have a Matrix account linked.", 400);
    }

    const roomId = await this.matrixRoomService.createPublicRoom(
      currentUser.matrix.userId,
      name,
      topic
    );

    if (!roomId) {
      throw new AppError("Failed to create public channel.", 500);
    }

    // Save to MongoDB
    await ChatRoom.create({
      matrixRoomId: roomId,
      type: "public",
      participants: [currentUser._id], // Creator is the first participant
      name,
      topic,
      createdBy: currentUser._id,
    });

    return { roomId };
  }

  public async deleteRoom(roomId: string) {
    // 1) Delete from Matrix
    const success = await this.matrixRoomService.deleteRoom(roomId);
    if (!success) {
      throw new AppError("Failed to delete room from Matrix", 500);
    }

    // 2) Delete from MongoDB
    await ChatRoom.deleteOne({ matrixRoomId: roomId });

    return { success: true };
  }

  public async updateRoom(roomId: string, requesterId: string, name?: string, topic?: string) {
    const currentUser = await User.findById(requesterId);
    const matrixUserId = currentUser?.matrix?.userId;

    if (!matrixUserId) {
      throw new AppError("User not linked to Matrix", 400);
    }

    // Update Matrix
    const success = await this.matrixRoomService.updateRoom(roomId, matrixUserId, name, topic);
    if (!success) {
      throw new AppError("Failed to update Matrix room", 500);
    }

    // Update MongoDB
    const updateData: any = {};
    if (name) updateData.name = name;
    if (topic !== undefined) updateData.topic = topic;

    await ChatRoom.updateOne({ matrixRoomId: roomId }, updateData);

    return { success: true };
  }

  public async inviteUser(roomId: string, userId: string) {
    const userToInvite = await User.findById(userId);
    if (!userToInvite?.matrix?.userId) {
      throw new AppError("User not found or no Matrix account", 404);
    }

    // Invite in Matrix
    const success = await this.matrixRoomService.inviteUser(roomId, userToInvite.matrix.userId);
    if (!success) {
      throw new AppError("Failed to invite user to Matrix room", 500);
    }

    // Update MongoDB participants
    await ChatRoom.updateOne(
      { matrixRoomId: roomId },
      { $addToSet: { participants: userId } }
    );

    return { success: true };
  }

  public async getPublicChannels() {
    const channels = await ChatRoom.find({ type: "public" })
      .select("matrixRoomId name topic slug region_code participants")
      .sort({ name: 1 })
      .lean();

    return channels;
  }
}
