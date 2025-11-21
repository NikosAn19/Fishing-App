// src/utils/s3.ts
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

/** Env με μικρό sanitization */
const rawEndpoint = process.env.R2_ENDPOINT || "";
// Αφαίρεση του bucket name από το endpoint αν υπάρχει
const endpoint = rawEndpoint
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/psarakibucket$/, ""); // χωρίς trailing "/" και bucket
const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
export const bucket = (process.env.S3_BUCKET || "").trim();
const cdnBase = (process.env.CDN_BASE || "").trim(); // προαιρετικό

console.log("🔧 S3 Config loaded:", {
  endpoint: endpoint ? "✅ Set" : "❌ Missing",
  bucket: bucket ? "✅ Set" : "❌ Missing",
  cdnBase: cdnBase ? `✅ ${cdnBase}` : "❌ Missing",
  accessKeyId: accessKeyId ? "✅ Set" : "❌ Missing",
});

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    "Missing R2 env vars (R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / S3_BUCKET)"
  );
}

/** S3 client για Cloudflare R2 */
export const s3 = new S3Client({
  region: "auto", // R2 απαιτεί "auto"
  endpoint, // π.χ. https://<account>.eu.r2.cloudflarestorage.com
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true, // ΚΡΙΣΙΜΟ για R2 (URL μορφής /bucket/key)
});

/** Δημιουργεί key για αποθήκευση αρχείου */
export function genFileKey(userId = "anon", ext = "jpg", variant = "original") {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid = randomUUID();
  return `${variant}/${userId}/${yyyy}/${mm}/${uuid}.${ext}`;
}

/** Presigned URL για PUT (upload) */
export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 300
) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

/** HeadObject: επιβεβαίωση ότι το object υπάρχει (μέγεθος, content-type κ.λπ.) */
export async function headObject(key: string) {
  return s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
}

/** Προσωρινό presigned GET (αν ο κουβάς δεν είναι public) */
export async function getPresignedGetUrl(key: string, expiresIn = 300) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

/** Public URL για προβολή (CDN αν έχεις, αλλιώς dev path στο R2) */
export function buildPublicUrl(key: string) {
  console.log("🔗 buildPublicUrl debug:", { cdnBase, endpoint, bucket, key });

  // Χρησιμοποίησε το CDN_BASE που δουλεύει
  if (cdnBase) {
    const url = `${cdnBase.replace(/\/+$/, "")}/${encodeURI(key)}`;
    console.log("🔗 Using CDN_BASE URL:", url);
    return url;
  }

  // Fallback: Hardcoded CDN URL (αφού το CDN_BASE δεν είναι set)
  const fallbackCdn = "https://pub-6152823702fd4064a507eac85c165f45.r2.dev";
  const url = `${fallbackCdn}/${encodeURI(key)}`;
  console.log("🔗 Using fallback CDN URL:", url);
  return url;

  // ΣΧΟΛΙΟ: Το raw R2 URL δεν δουλεύει - δίνει 400 errors
  // const url = `${endpoint}/${bucket}/${encodeURI(key)}`;
}
/** Extract R2 key from CDN URL */
export function extractKeyFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Try with CDN_BASE from env
    if (cdnBase) {
      const cdnBaseClean = cdnBase.replace(/\/+$/, "");
      if (url.startsWith(cdnBaseClean)) {
        const key = url.substring(cdnBaseClean.length + 1); // +1 for the slash
        return decodeURIComponent(key);
      }
    }

    // Try with fallback hardcoded CDN
    const fallbackCdn = "https://pub-6152823702fd4064a507eac85c165f45.r2.dev";
    if (url.startsWith(fallbackCdn)) {
      const key = url.substring(fallbackCdn.length + 1); // +1 for the slash
      return decodeURIComponent(key);
    }

    // If URL doesn't match known CDN patterns, return null
    return null;
  } catch (error) {
    console.warn("extractKeyFromUrl failed:", error);
    return null;
  }
}

/** Delete object from R2 */
export async function deleteObject(key: string): Promise<boolean> {
  if (!key) {
    console.warn("deleteObject: No key provided");
    return false;
  }

  try {
    const cmd = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3.send(cmd);
    console.log("✅ Successfully deleted object from R2:", key);
    return true;
  } catch (error) {
    console.warn("❌ Failed to delete object from R2:", key, error);
    return false;
  }
}

/** (Προαιρετικά) μικρά debug helpers για διαγνώσεις */
export async function r2HeadBucket() {
  return s3.send(new HeadBucketCommand({ Bucket: bucket }));
}
export async function r2ListBuckets() {
  // R2 συχνά δεν επιστρέφει λίστα buckets με αυτό το API/token· είναι απλώς για debug.
  return s3.send(new ListBucketsCommand({}));
}
