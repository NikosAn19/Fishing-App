import { Request, Response, NextFunction } from "express";
import { ChatService } from "../services/ChatService";
import { AppError } from "../../../middleware/error/AppError";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  public async startDirectChat(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { recipientId } = req.body;
      const result = await this.chatService.startDirectChat(
        req.user._id.toString(),
        recipientId
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  }

  public async createChannel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { name, topic } = req.body;
      const result = await this.chatService.createChannel(
        req.user._id.toString(),
        name,
        topic
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  }

  public async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { roomId } = req.params;
      if (!roomId) throw new AppError("Room ID is required", 400);

      const result = await this.chatService.deleteRoom(roomId);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { roomId } = req.params;
      if (!roomId) throw new AppError("Room ID is required", 400);

      const { name, topic } = req.body;
      const result = await this.chatService.updateRoom(
        roomId,
        req.user._id.toString(),
        name,
        topic
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { roomId } = req.params;
      if (!roomId) throw new AppError("Room ID is required", 400);

      const { userId } = req.body;
      const result = await this.chatService.inviteUser(roomId, userId);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async getPublicChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const channels = await this.chatService.getPublicChannels();
      return res.json({ success: true, channels });
    } catch (error) {
      return next(error);
    }
  }
}
