// src/services/uploads.ts
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

/** Διαβάζουμε το base από env (Expo), αλλιώς πέφτουμε σε dev/prod defaults */
const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  // @ts-ignore - Expo dev env shim
  (globalThis as any).__expo?.env?.EXPO_PUBLIC_API_BASE ??
  (__DEV__ ? "http://localhost:3000" : "https://your-prod-api");

/** Κανονικοποίηση base URL + ειδική μεταχείριση για Android emulator */
function normalizeBase(base: string) {
  if (!base) return base;
  let b = base.trim().replace(/\/+$/, ""); // κόψε trailing slashes

  console.log("🌊 Original base:", base, "Platform:", Platform.OS);

  // Για Android mobile hotspot, δοκίμασε διάφορες επιλογές
  if (Platform.OS === "android") {
    // Αντικατάστασε localhost/127.0.0.1 με το mobile hotspot IP
    if (b.includes("localhost") || b.includes("127.0.0.1")) {
      b = b
        .replace("localhost", "10.120.42.28")
        .replace("127.0.0.1", "10.120.42.28");
      console.log("🌊 Android: localhost -> 10.120.42.28 (mobile hotspot IP)");
    }
    // Αντικατάστασε local network IPs με το mobile hotspot IP
    else if (
      b.includes("192.168.") ||
      b.includes("10.0.2.2") ||
      b.includes("10.120.42.28")
    ) {
      b = b
        .replace(/192\.168\.\d+\.\d+/, "10.120.42.28")
        .replace("10.0.2.2", "10.120.42.28")
        .replace("10.120.42.28", "10.120.42.28");
      console.log("🌊 Android: network IP -> 10.120.42.28 (mobile hotspot IP)");
    }
  }

  console.log("🌊 Final base:", b);
  return b;
}

const API_BASE = normalizeBase(RAW_BASE);

type SignRes = {
  fileKey: string;
  uploadUrl: string;
  headers?: Record<string, string>;
};
type CompleteRes = {
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
