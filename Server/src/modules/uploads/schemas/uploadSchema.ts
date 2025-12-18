import { z } from "zod";

export const signUploadSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
  ext: z.enum(["jpg", "jpeg", "png", "webp", "heic"]).default("jpg"),
});

export const completeUploadSchema = z.object({
  fileKey: z.string().min(5),
  contentType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/heic"])
    .optional(),
  size: z.number().int().positive().optional(),
});
