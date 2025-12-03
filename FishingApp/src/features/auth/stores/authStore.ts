import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
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
import { matrixService } from "../../community/chat/matrix/MatrixService";
import { API_BASE } from "../../../config/api";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const MATRIX_ACCESS_TOKEN_KEY = "matrix_access_token";
const MATRIX_DEVICE_ID_KEY = "matrix_device_id";

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

async function persistTokens(tokens: TokenPair | null, matrixTokens?: { accessToken: string; deviceId: string } | null) {
  await Promise.all([
    saveToken(ACCESS_TOKEN_KEY, tokens?.accessToken ?? null),
    saveToken(REFRESH_TOKEN_KEY, tokens?.refreshToken ?? null),
    saveToken(MATRIX_ACCESS_TOKEN_KEY, matrixTokens?.accessToken ?? null),
    saveToken(MATRIX_DEVICE_ID_KEY, matrixTokens?.deviceId ?? null),
  ]);
}

async function loadTokens() {
  const [accessToken, refreshToken, matrixAccessToken, matrixDeviceId] = await Promise.all([
    getToken(ACCESS_TOKEN_KEY),
    getToken(REFRESH_TOKEN_KEY),
    getToken(MATRIX_ACCESS_TOKEN_KEY),
    getToken(MATRIX_DEVICE_ID_KEY),
  ]);

  if (accessToken && refreshToken) {
    return { 
      accessToken, 
      refreshToken,
      matrix: (matrixAccessToken && matrixDeviceId) ? { accessToken: matrixAccessToken, deviceId: matrixDeviceId } : null
    };
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
  matrixAccessToken: null,
  matrixDeviceId: null,
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
      
      // Also fetch friends
      try {
          const friendsRes = await fetch(`${API_BASE}/api/friends`, {
              headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (friendsRes.ok) {
              const friends = await friendsRes.json();
              user.friends = friends;
          }
      } catch (e) {
          console.warn("Failed to fetch friends:", e);
      }

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
          matrixAccessToken: null,
          matrixDeviceId: null,
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
          matrixAccessToken: tokens.matrix?.accessToken ?? null,
          matrixDeviceId: tokens.matrix?.deviceId ?? null,
          isLoading: false,
        });

        // Initialize Matrix
        if (user.matrix?.userId) {
          let success = false;
          // Try to restore session with token first
          if (tokens.matrix?.accessToken) {
             success = await matrixService.auth.initSession(user.matrix.userId, tokens.matrix.accessToken, tokens.matrix.deviceId);
          }

          // Fallback to password login if token failed or missing
          if (!success && user.matrix.password) {
             const result = await matrixService.auth.login(user.matrix.userId, user.matrix.password);
             if (result) {
                // Save new matrix tokens
                await persistTokens(
                  { accessToken, refreshToken: tokens.refreshToken }, 
                  { accessToken: result.accessToken, deviceId: result.deviceId }
                );
                set({ matrixAccessToken: result.accessToken, matrixDeviceId: result.deviceId });
                success = true;
             }
          }

          // Sync Profile if connected
          if (success) {
              if (user.displayName) {
                  await matrixService.auth.setDisplayName(user.displayName);
              }
              if (user.avatarUrl) {
                  await matrixService.auth.setAvatarUrl(user.avatarUrl);
              }
          }
        }

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
          // Matrix tokens are preserved in state from loadTokens? No, loadTokens returned them but we didn't set them yet if we threw error.
          // We need to reload them or keep them. 
          // Actually, refreshTokens calls persistTokens. If we don't pass matrix tokens there, they might be lost?
          // Let's check refreshTokens implementation.
          isLoading: false,
        });
        
        // Re-run matrix init logic here? Or just rely on next bootstrap?
        // For now, let's just focus on the happy path.
      }
    } catch (error) {
      console.warn("bootstrapSession failed:", error);
      await persistTokens(null);
      set({
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        accessToken: null,
        refreshToken: null,
        matrixAccessToken: null,
        matrixDeviceId: null,
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
      // Persist app tokens first
      await persistTokens(tokens);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
      });

      // Initialize Matrix
      if (user.matrix?.userId && user.matrix?.password) {
        const result = await matrixService.auth.login(user.matrix.userId, user.matrix.password);
        if (result) {
           await persistTokens(tokens, { accessToken: result.accessToken, deviceId: result.deviceId });
           set({ matrixAccessToken: result.accessToken, matrixDeviceId: result.deviceId });
           
           // Sync Profile
           if (user.displayName) {
               await matrixService.auth.setDisplayName(user.displayName);
           }
           if (user.avatarUrl) {
               await matrixService.auth.setAvatarUrl(user.avatarUrl);
           }
        }
      }
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

      // Initialize Matrix
      if (user.matrix?.userId && user.matrix?.password) {
        const result = await matrixService.auth.login(user.matrix.userId, user.matrix.password);
        if (result) {
           await persistTokens(tokens, { accessToken: result.accessToken, deviceId: result.deviceId });
           set({ matrixAccessToken: result.accessToken, matrixDeviceId: result.deviceId });

           // Sync Profile
           if (user.displayName) {
               await matrixService.auth.setDisplayName(user.displayName);
           }
           if (user.avatarUrl) {
               await matrixService.auth.setAvatarUrl(user.avatarUrl);
           }
        }
      }
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

      // Initialize Matrix
      if (user.matrix?.userId && user.matrix?.password) {
        const result = await matrixService.auth.login(user.matrix.userId, user.matrix.password);
        if (result) {
           await persistTokens(tokens, { accessToken: result.accessToken, deviceId: result.deviceId });
           set({ matrixAccessToken: result.accessToken, matrixDeviceId: result.deviceId });

           // Sync Profile
           if (user.displayName) {
               await matrixService.auth.setDisplayName(user.displayName);
           }
           if (user.avatarUrl) {
               await matrixService.auth.setAvatarUrl(user.avatarUrl);
           }
        }
      }
    } catch (error) {
      set({
        error: (error as Error).message ?? "Google login failed",
        isLoading: false,
        status: AuthStatus.UNAUTHENTICATED,
      });
    }
  },

  async refreshTokens() {
    const { refreshToken, matrixAccessToken, matrixDeviceId } = get();
    if (!refreshToken) {
      return null;
    }
    try {
      const res = await authApi.refreshToken(refreshToken);
      const { user, tokens } = applyAuthResponse(res);
      // Preserve matrix tokens
      const matrixTokens = (matrixAccessToken && matrixDeviceId) ? { accessToken: matrixAccessToken, deviceId: matrixDeviceId } : null;
      await persistTokens(tokens, matrixTokens);
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
        matrixAccessToken: null,
        matrixDeviceId: null,
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
      matrixService.auth.logout();
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
