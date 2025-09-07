// src/utils/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const endpoint = process.env.R2_ENDPOINT!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.S3_BUCKET!;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error("Missing R2 env vars (R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / S3_BUCKET)");
}

export const s3 = new S3Client({
  region: "auto",               // R2 απαιτεί "auto"
  endpoint,                     // π.χ. https://<account>.eu.r2.cloudflarestorage.com
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,         // 🔴 ΚΡΙΣΙΜΟ για R2 (να είναι /bucket/key)
});

export function genFileKey(userId = "anon", ext = "jpg", variant = "original") {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid = randomUUID();
  return `${variant}/${userId}/${yyyy}/${mm}/${uuid}.${ext}`;
}

export async function getPresignedPutUrl(key: string, contentType: string, expiresIn = 300) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn });

  // Optional: μικρό debug να δεις το URL που φτιάχνεται
  // console.log("[R2] presigned:", url);

  return url;
}
