import {
  genFileKey,
  getPresignedPutUrl,
  headObject,
  buildPublicUrl,
  bucket,
} from "../../../utils/s3";
import AssetModel from "../../../models/Asset";
import { AppError } from "../../../middleware/error/AppError";

export class UploadService {
  public async generatePresignedUrl(userId: string, contentType: string, ext: string) {
    const key = genFileKey(userId || "anon", ext, "original");
    const uploadUrl = await getPresignedPutUrl(key, contentType);

    return {
      fileKey: key,
      uploadUrl,
      headers: { "Content-Type": contentType },
    };
  }

  public async completeUpload(userId: string | null, fileKey: string, contentType?: string, size?: number) {
    // 1) Verify existence in R2/S3
    const head = await headObject(fileKey);
    const detectedSize = Number(head.ContentLength ?? size ?? 0);
    const detectedType = String(
      head.ContentType ?? contentType ?? "application/octet-stream"
    );

    // 2) Basic validation (only images for now, as per legacy logic)
    if (!detectedType.startsWith("image/")) {
      throw new AppError("Only images are allowed", 400);
    }

    // 3) Create database record
    const doc = await AssetModel.create({
      userId: userId ? userId : null,
      bucket,
      key: fileKey,
      contentType: detectedType,
      size: detectedSize,
    });

    // 4) Return DTO
    return {
      id: doc._id,
      key: fileKey,
      url: buildPublicUrl(fileKey),
      contentType: detectedType,
      size: detectedSize,
      createdAt: doc.createdAt,
    };
  }
}
