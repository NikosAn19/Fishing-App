// src/services/uploads.ts
import * as FileSystem from "expo-file-system/legacy";
import { API_BASE } from "../config/api";

// API_BASE is now imported from centralized config

export type SignRes = {
  fileKey: string;
  uploadUrl: string;
  headers?: Record<string, string>;
};
export type CompleteRes = {
  id: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
};

async function signUpload(contentType: string, ext: string): Promise<SignRes> {
  console.log("📝 Calling sign upload API:", `${API_BASE}/api/uploads/sign`);
  const res = await fetch(`${API_BASE}/api/uploads/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, ext }),
  });
  console.log("📝 Sign response status:", res.status);
  if (!res.ok) throw new Error(`sign failed: ${res.status}`);
  return res.json();
}

async function putToR2(
  uploadUrl: string,
  localUri: string,
  contentType: string
) {
  // Expo: ανεβάζουμε binary χωρίς multipart
  const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
  });
  if (result.status !== 200) {
    throw new Error(
      `R2 PUT failed: ${result.status} ${result.body?.slice?.(0, 200) ?? ""}`
    );
  }
}

async function completeUpload(
  fileKey: string,
  contentType?: string
): Promise<CompleteRes> {
  console.log(
    "✅ Calling complete upload API:",
    `${API_BASE}/api/uploads/complete`
  );
  const res = await fetch(`${API_BASE}/api/uploads/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileKey, contentType }),
  });
  console.log("✅ Complete response status:", res.status);
  if (!res.ok) throw new Error(`complete failed: ${res.status}`);
  return res.json();
}

/** High-level: υπογράφει → ανεβάζει → κάνει complete → επιστρέφει asset */
export async function uploadImageAndRegister(
  localUri: string
): Promise<CompleteRes> {
  console.log("📤 uploadImageAndRegister called with URI:", localUri);

  // πολύ απλό sniff για mime/extension από το uri
  const lower = localUri.toLowerCase();
  const isPng = lower.endsWith(".png");
  const isJpg = lower.endsWith(".jpg") || lower.endsWith(".jpeg");
  const ext = isPng ? "png" : "jpg";
  const contentType = isPng ? "image/png" : "image/jpeg";

  console.log("🔍 Detected file type:", { ext, contentType });

  console.log("📝 Step 1: Signing upload...");
  const { fileKey, uploadUrl } = await signUpload(contentType, ext);
  console.log("✅ Sign successful:", {
    fileKey,
    uploadUrl: uploadUrl.substring(0, 50) + "...",
  });

  console.log("📤 Step 2: Uploading to R2...");
  await putToR2(uploadUrl, localUri, contentType);
  console.log("✅ R2 upload successful");

  console.log("✅ Step 3: Completing upload...");
  const asset = await completeUpload(fileKey, contentType);
  console.log("✅ Upload complete:", asset);

  return asset;
}
