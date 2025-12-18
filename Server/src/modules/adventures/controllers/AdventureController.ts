import { Request, Response, NextFunction } from "express";
import { AdventureService } from "../services/AdventureService";
import { AdventureStatus } from "../../../models/Adventure";
import { AppError } from "../../../middleware/error/AppError";

export class AdventureController {
  private adventureService: AdventureService;

  constructor() {
    this.adventureService = new AdventureService();
  }

  public async getAdventures(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const status = req.query.status as AdventureStatus | undefined;
      const adventures = await this.adventureService.getAdventures(
        req.user._id.toString(),
        status
      );
      return res.json({ success: true, adventures });
    } catch (error) {
      return next(error);
    }
  }

  public async getAdventure(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      if (!id) throw new AppError("Adventure ID is required", 400);
      
      const adventure = await this.adventureService.getAdventureById(
        id,
        req.user._id.toString()
      );
      return res.json({ success: true, adventure });
    } catch (error) {
      return next(error);
    }
  }

  public async createAdventure(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const adventure = await this.adventureService.createAdventure(
        req.user._id.toString(),
        req.body
      );
      return res.status(201).json({ success: true, adventure });
    } catch (error) {
      return next(error);
    }
  }

  public async updateAdventure(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      if (!id) throw new AppError("Adventure ID is required", 400);

      const adventure = await this.adventureService.updateAdventure(
        id,
        req.user._id.toString(),
        req.body
      );
      return res.json({ success: true, adventure });
    } catch (error) {
      return next(error);
    }
  }

  public async deleteAdventure(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      if (!id) throw new AppError("Adventure ID is required", 400);

      const result = await this.adventureService.deleteAdventure(
        id,
        req.user._id.toString()
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  }
}
