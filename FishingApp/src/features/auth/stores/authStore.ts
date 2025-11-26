import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  AuthSuccessResponse,
  AuthStatus,
  AuthUser,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/authTypes";
import { authApi } from "../api/client";
import { AuthActions, AuthState, AuthStore, TokenPair } from "../types/authStoreTypes";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

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
  status: AuthStatus.IDLE,
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  isLoading: false,

  clearError() {
    set({ error: null });
  },

  async refreshUser() {
    const { accessToken } = get();
    if (!accessToken) {
      console.warn("refreshUser: No access token available");
      return;
    }

    try {
      const user = await authApi.me(accessToken);
      set({ user }); // Only update user, don't change status
      console.log("✅ User refreshed successfully");
    } catch (error) {
      console.warn("refreshUser failed:", error);
      // Don't change status on error, just log it
      // If token is invalid, bootstrapSession will handle it on next app start
    }
  },

  async bootstrapSession() {
    if (get().status === AuthStatus.CHECKING) return;
    set({ status: AuthStatus.CHECKING, isLoading: true, error: null });

    try {
      const tokens = await loadTokens();
      if (!tokens) {
        set({
          status: AuthStatus.UNAUTHENTICATED,
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
          status: AuthStatus.AUTHENTICATED,
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
          status: AuthStatus.AUTHENTICATED,
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
        status: AuthStatus.UNAUTHENTICATED,
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
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Registration failed",
        isLoading: false,
        status: AuthStatus.UNAUTHENTICATED,
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
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Login failed",
        isLoading: false,
        status: AuthStatus.UNAUTHENTICATED,
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
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message ?? "Google login failed",
        isLoading: false,
        status: AuthStatus.UNAUTHENTICATED,
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
        status: AuthStatus.AUTHENTICATED,
      });
      return tokens.accessToken;
    } catch (error) {
      console.warn("refreshTokens failed:", error);
      await persistTokens(null);
      set({
        status: AuthStatus.UNAUTHENTICATED,
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
        status: AuthStatus.UNAUTHENTICATED,
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
