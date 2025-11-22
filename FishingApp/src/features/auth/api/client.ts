import { JSON_HEADERS, apiFetchJson } from "../../../utils/apiClient";
import {
  AuthSuccessResponse,
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  AuthUser,
} from "../types";

const BASE_PATH = "/api/auth";

export async function register(
  payload: RegisterRequest
): Promise<AuthSuccessResponse> {
  return apiFetchJson<AuthSuccessResponse>(`${BASE_PATH}/register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function login(
  payload: LoginRequest
): Promise<AuthSuccessResponse> {
  return apiFetchJson<AuthSuccessResponse>(`${BASE_PATH}/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function loginWithGoogle(
  payload: GoogleLoginRequest
): Promise<AuthSuccessResponse> {
  return apiFetchJson<AuthSuccessResponse>(`${BASE_PATH}/google`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthSuccessResponse> {
  return apiFetchJson<AuthSuccessResponse>(`${BASE_PATH}/refresh`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
    skipAuth: true, // We handle refresh token explicitly
  });
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await apiFetchJson(`${BASE_PATH}/logout`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
    // Logout might need auth header if server requires it, but usually we just invalidate refresh token
    // The original code didn't skip auth, but didn't explicitly add it either (except via global fetch which doesn't add it)
    // But wait, original code used postJson which uses fetch. It did NOT add auth header.
    // So skipAuth: true is probably safer or correct to match original behavior.
    skipAuth: true, 
  });
}

export async function me(token: string): Promise<AuthUser> {
  const data = await apiFetchJson<{ success: boolean; user: AuthUser }>(`${BASE_PATH}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // We provide token explicitly, so we can skip the store lookup to avoid confusion, 
    // though it wouldn't hurt if store was empty.
    skipAuth: true, 
  });
  
  if (!data.success) {
    throw new Error("Failed to fetch user profile");
  }
  return data.user;
}

export const authApi = {
  register,
  login,
  loginWithGoogle,
  refreshToken,
  logout,
  me,
};
