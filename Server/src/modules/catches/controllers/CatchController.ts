import { Request, Response, NextFunction } from "express";
import { CatchService } from "../services/CatchService";
import { AppError } from "../../../middleware/error/AppError";

export class CatchController {
  private catchService: CatchService;

  constructor() {
    this.catchService = new CatchService();
  }

  public async listCatches(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const page = Math.max(Number(req.query.page) || 1, 1);
      
      // If we want to filter by userId, we get it from req.user
      const userId = req.user?._id.toString();

      const result = await this.catchService.listCatches(page, limit, userId);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async createCatch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const result = await this.catchService.createCatch(req.user._id.toString(), req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async getCatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.catchService.getCatchById(id!);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async updateCatch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      const result = await this.catchService.updateCatch(id!, req.user._id.toString(), req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async deleteCatch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      const result = await this.catchService.deleteCatch(id!, req.user._id.toString());
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}
