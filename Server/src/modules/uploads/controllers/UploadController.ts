import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/UploadService";
import { AppError } from "../../../middleware/error/AppError";

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  public async signUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentType, ext } = req.body;
      const userId = req.user?._id.toString() || "anon";
      
      const result = await this.uploadService.generatePresignedUrl(userId, contentType, ext);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async completeUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey, contentType, size } = req.body;
      const userId = req.user?._id.toString() || null;

      const result = await this.uploadService.completeUpload(userId, fileKey, contentType, size);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}
