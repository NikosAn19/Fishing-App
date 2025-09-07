// src/routes/uploads.ts
import { Router } from "express";
import { z } from "zod";
import { genFileKey, getPresignedPutUrl } from "../utils/s3";

const router = Router();

const bodySchema = z.object({
  contentType: z.enum(["image/jpeg","image/png","image/webp","image/heic"]),
  ext: z.enum(["jpg","jpeg","png","webp","heic"]).default("jpg"),
});

router.post("/sign", async (req, res, next) => {
  try {
    const userId = (req as any).user?.id ?? "anon";
    const { contentType, ext } = bodySchema.parse(req.body);

    const key = genFileKey(userId, ext, "original");
    const uploadUrl = await getPresignedPutUrl(key, contentType);

    res.json({ fileKey: key, uploadUrl, headers: { "Content-Type": contentType } });
  } catch (err) {
    next(err);
  }
});

export default router;
