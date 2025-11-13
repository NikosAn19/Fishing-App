import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  AuthUser,
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  AuthSuccessResponse,
} from "../features/auth/types";
import { authApi } from "../features/auth/api/client";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

type TokenPair = { accessToken: string; refreshToken: string };

async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function saveToken(key: string, value: string | null): Promise<void> {
  const available = await isSecureStoreAvailable();
  if (available) {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    return;
  }

  if (typeof localStorage !== "undefined") {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}

async function getToken(key: string): Promise<string | null> {
  const available = await isSecureStoreAvailable();
  if (available) {
    return SecureStore.getItemAsync(key);
  }

  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }

  return null;
}

async function persistTokens(tokens: TokenPair | null) {
  await Promise.all([
    saveToken(ACCESS_TOKEN_KEY, tokens?.accessToken ?? null),
    saveToken(REFRESH_TOKEN_KEY, tokens?.refreshToken ?? null),
  ]);
}

async function loadTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getToken(ACCESS_TOKEN_KEY),
    getToken(REFRESH_TOKEN_KEY),
  ]);

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  isLoading: boolean;
}

interface AuthActions {
  bootstrapSession: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

function applyAuthResponse(response: AuthSuccessResponse): {
  user: AuthUser;
  tokens: TokenPair;
} {
  return {
    user: response.user,
    tokens: {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    },
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "idle",
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  isLoading: false,

  clearError() {
    set({ error: null });
  },

  async bootstrapSession() {
    if (get().status === "checking") return;
    set({ status: "checking", isLoading: true, error: null });

    try {
      const tokens = await loadTokens();
      if (!tokens) {
        set({
          status: "unauthenticated",
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoading: false,
        });
        return;
      }

      let accessToken = tokens.accessToken;
      try {
        const user = await authApi.me(accessToken);
        set({
          status: "authenticated",
          user,
          accessToken,
          refreshToken: tokens.refreshToken,
          isLoading: false,
        });
        return;
      } catch (error) {
        // Attempt to refresh and retry once
        const newAccessToken = await get().refreshTokens();
        if (!newAccessToken) {
          throw error;
        }
        accessToken = newAccessToken;
        const user = await authApi.me(accessToken);
        set({
          status: "authenticated",
          user,
          accessToken,
          refreshToken: get().refreshToken,
          isLoading: false,
        });
      }
    } catch (error) {
      console.warn("bootstrapSession failed:", error);
      await persistTokens(null);
      set({
        status: "unauthenticated",
        user: null,
        accessToken: null,
        refreshToken: null,
        error: (error as Error).message ?? "Session expired",
        isLoading: false,
      });
    }
  },

  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(payload);
      const { user, tokens } = applyAuthResponse(data);
      await persistTokens(tokens);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: "authenticated",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Registration failed",
        isLoading: false,
        status: "unauthenticated",
      });
    }
  },

  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(payload);
      const { user, tokens } = applyAuthResponse(data);
      await persistTokens(tokens);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: "authenticated",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Login failed",
        isLoading: false,
        status: "unauthenticated",
      });
    }
  },

  async loginWithGoogle(payload) {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.loginWithGoogle(payload);
      const { user, tokens } = applyAuthResponse(data);
      await persistTokens(tokens);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: "authenticated",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Google login failed",
        isLoading: false,
        status: "unauthenticated",
      });
    }
  },

  async refreshTokens() {
    const { refreshToken } = get();
    if (!refreshToken) {
      return null;
    }
    try {
      const res = await authApi.refreshToken(refreshToken);
      const { user, tokens } = applyAuthResponse(res);
      await persistTokens(tokens);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: "authenticated",
      });
      return tokens.accessToken;
    } catch (error) {
      console.warn("refreshTokens failed:", error);
      await persistTokens(null);
      set({
        status: "unauthenticated",
        user: null,
        accessToken: null,
        refreshToken: null,
        error: (error as Error).message ?? "Session expired",
      });
      return null;
    }
  },

  async logout() {
    const refreshToken = get().refreshToken;
    set({ isLoading: true, error: null });
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.warn("logout error:", error);
    } finally {
      await persistTokens(null);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        status: "unauthenticated",
        isLoading: false,
        error: null,
      });
    }
  },
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
  subscribe: useAuthStore.subscribe,
};
