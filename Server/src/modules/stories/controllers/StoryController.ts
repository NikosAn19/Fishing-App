import { Request, Response, NextFunction } from "express";
import { StoryService } from "../services/StoryService";
import { AppError } from "../../../middleware/error/AppError";

export class StoryController {
  private storyService: StoryService;

  constructor() {
    this.storyService = new StoryService();
  }

  public async createStory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const story = await this.storyService.createStory(req.user._id.toString(), req.body);
      return res.status(201).json(story);
    } catch (error) {
      return next(error);
    }
  }

  public async getStoriesFeed(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const feed = await this.storyService.getStoriesFeed(req.user._id.toString());
      return res.json(feed);
    } catch (error) {
      return next(error);
    }
  }

  public async viewStory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      const result = await this.storyService.viewStory(req.user._id.toString(), id!);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async deleteStory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;
      const result = await this.storyService.deleteStory(req.user._id.toString(), id!);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}
