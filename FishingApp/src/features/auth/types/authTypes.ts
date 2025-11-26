export enum AuthStatus {
  IDLE = "idle",
  CHECKING = "checking",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  providers: {
    email: boolean;
    google: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSuccessResponse {
  success: true;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
