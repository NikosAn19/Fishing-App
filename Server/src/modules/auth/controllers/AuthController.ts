import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { AppError } from "../../../middleware/error/AppError";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);
      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const result = await this.authService.googleLogin(idToken);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  public async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const userProfile = this.authService.getUserProfile(req.user);
      return res.json({
        success: true,
        user: userProfile,
      });
    } catch (error) {
      return next(error);
    }
  }
}
