declare module "google-auth-library" {
  export interface TokenPayload {
    iss?: string;
    sub?: string;
    aud?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    locale?: string;
    exp?: number;
    iat?: number;
  }

  interface VerifyIdTokenOptions {
    idToken: string;
    audience: string | string[];
  }

  export class OAuth2Client {
    constructor(clientId?: string, clientSecret?: string, redirectUri?: string);
    verifyIdToken(options: VerifyIdTokenOptions): Promise<{
      getPayload(): TokenPayload | undefined;
    }>;
  }
}
