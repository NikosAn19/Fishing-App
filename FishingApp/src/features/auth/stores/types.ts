import {
  AuthStatus,
  AuthSuccessResponse,
  AuthUser,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from "../types";

export type TokenPair = { accessToken: string; refreshToken: string };

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface AuthActions {
  bootstrapSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;
