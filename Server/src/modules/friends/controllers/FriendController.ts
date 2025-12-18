import { Request, Response, NextFunction } from "express";
import { FriendService } from "../services/FriendService";
import { AppError } from "../../../middleware/error/AppError";

export class FriendController {
  private friendService: FriendService;

  constructor() {
    this.friendService = new FriendService();
  }

  public async getFriendsList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const friends = await this.friendService.getFriendsList(
        req.user._id.toString()
      );
      return res.json(friends);
    } catch (error) {
      return next(error);
    }
  }

  public async sendFriendRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { targetUserId } = req.body;
      const result = await this.friendService.sendFriendRequest(
        req.user._id.toString(),
        targetUserId
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async acceptFriendRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { requesterId } = req.body;
      const result = await this.friendService.acceptFriendRequest(
        req.user._id.toString(),
        requesterId
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async rejectFriendRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { requesterId } = req.body;
      const result = await this.friendService.rejectFriendRequest(
        req.user._id.toString(),
        requesterId
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}
