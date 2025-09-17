// src/routes/uploads.ts
import { Router } from "express";
import { z } from "zod";
import {
  genFileKey,
  getPresignedPutUrl,
  headObject,
  buildPublicUrl,
  bucket,
} from "../utils/s3";
import AssetModel from "../models/Asset";

const router = Router();

const signBody = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
  ext: z.enum(["jpg", "jpeg", "png", "webp", "heic"]).default("jpg"),
});

router.post("/sign", async (req, res, next) => {
  try {
    console.log("📝 POST /api/uploads/sign - Received request");
    const userId = (req as any).user?.id ?? null;
    const { contentType, ext } = signBody.parse(req.body);
    console.log("📋 Sign request:", { contentType, ext, userId });

    const key = genFileKey(userId ?? "anon", ext, "original");
    const uploadUrl = await getPresignedPutUrl(key, contentType);
    console.log("✅ Generated presigned URL for key:", key);

    res.json({
      fileKey: key,
      uploadUrl,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.log("❌ Sign error:", err);
    next(err);
  }
});

const completeBody = z.object({
  fileKey: z.string().min(5),
  contentType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/heic"])
    .optional(),
  size: z.number().int().positive().optional(), // προαιρετικά από client
});

router.post("/complete", async (req, res, next): Promise<void> => {
  try {
    console.log("✅ POST /api/uploads/complete - Received request");
    const userId = (req as any).user?.id ?? null;
    const { fileKey, contentType, size } = completeBody.parse(req.body);
    console.log("📋 Complete request:", { fileKey, contentType, size, userId });

    // 1) Επιβεβαίωση ύπαρξης στο R2
    console.log("🔍 Checking if file exists in R2...");
    const head = await headObject(fileKey); // throws αν δεν υπάρχει
    const detectedSize = Number(head.ContentLength ?? size ?? 0);
    const detectedType = String(
      head.ContentType ?? contentType ?? "application/octet-stream"
    );
    console.log("✅ File found in R2:", { detectedSize, detectedType });

    // 2) (προαιρετικό) περιορισμοί τύπου/μεγέθους
    if (!detectedType.startsWith("image/")) {
      console.log("❌ File is not an image:", detectedType);
      res.status(400).json({ error: "Only images are allowed" });
      return;
    }

    // 3) Δημιουργία εγγραφής στη Mongo
    console.log("💾 Creating asset record in MongoDB...");
    const doc = await AssetModel.create({
      userId,
      bucket,
      key: fileKey,
      contentType: detectedType,
      size: detectedSize,
      // width/height/exif θα τα προσθέσουμε αργότερα σε background job
    });
    console.log("✅ Asset created:", doc._id);

    // 4) URLs για προβολή
    const publicUrl = buildPublicUrl(fileKey);
    console.log("🔗 Generated public URL:", publicUrl);
    // για production private buckets, μπορείς να δίνεις presigned GET:
    // const viewUrl = await getPresignedGetUrl(fileKey, 300);

    const response = {
      id: doc._id,
      key: fileKey,
      url: publicUrl,
      contentType: detectedType,
      size: detectedSize,
      createdAt: doc.createdAt,
    };
    console.log("📤 Sending response:", response);

    res.json(response);
  } catch (err) {
    console.log("❌ Complete error:", err);
    next(err);
  }
});

export default router;
