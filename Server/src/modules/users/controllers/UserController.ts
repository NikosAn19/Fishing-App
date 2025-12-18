import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { AppError } from "../../../middleware/error/AppError";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const user = await this.userService.getProfile(req.user._id.toString());
      return res.json({ success: true, user });
    } catch (error) {
      return next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const user = await this.userService.updateProfile(req.user._id.toString(), req.body);
      return res.json({ success: true, user });
    } catch (error) {
      return next(error);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError("User ID is required", 400);
      const user = await this.userService.getUserById(id);
      return res.json({ success: true, user });
    } catch (error) {
      return next(error);
    }
  }

  public async lookupUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { matrixId } = req.query;
      if (!matrixId || typeof matrixId !== "string") {
        throw new AppError("Matrix ID is required", 400);
      }
      const user = await this.userService.lookupUserByMatrixId(matrixId);
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  public async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        throw new AppError("Query parameter is required", 400);
      }
      const users = await this.userService.searchUsers(query, req.user._id.toString());
      return res.json({ success: true, users });
    } catch (error) {
      return next(error);
    }
  }

  public async updatePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { token } = req.body;
      const result = await this.userService.updatePushToken(
        req.user._id.toString(),
        token
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}
