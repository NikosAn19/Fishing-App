import { OAuth2Client, TokenPayload } from "google-auth-library";
import config from "../config/config";

if (!config.googleClientId) {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID is not set. Google login will not work until it is configured."
  );
}

const client = config.googleClientId
  ? new OAuth2Client(config.googleClientId)
  : null;

export async function verifyGoogleIdToken(
  idToken: string
): Promise<TokenPayload> {
  if (!client || !config.googleClientId) {
    throw new Error("Google client ID is not configured");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google ID token payload");
  }

  return payload;
}
