import { Request, Response, NextFunction } from "express";
import { FavoriteSpotService } from "../services/FavoriteSpotService";
import { AppError } from "../../../middleware/error/AppError";

export class FavoriteSpotController {
  private favoriteSpotService: FavoriteSpotService;

  constructor() {
    this.favoriteSpotService = new FavoriteSpotService();
  }

  public async getFavoriteSpots(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const spots = await this.favoriteSpotService.getFavoriteSpots(
        req.user._id.toString()
      );
      return res.json({ success: true, favoriteSpots: spots });
    } catch (error) {
      return next(error);
    }
  }

  public async addFavoriteSpot(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const spot = await this.favoriteSpotService.addFavoriteSpot(
        req.user._id.toString(),
        req.body
      );
      return res.status(201).json({ success: true, favoriteSpot: spot });
    } catch (error) {
      return next(error);
    }
  }

  public async deleteFavoriteSpot(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      if (!id) throw new AppError("Favorite spot ID is required", 400);

      const result = await this.favoriteSpotService.deleteFavoriteSpot(
        id,
        req.user._id.toString()
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  }
}
