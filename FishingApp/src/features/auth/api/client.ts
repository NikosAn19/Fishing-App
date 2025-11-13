import { API_BASE } from "../../../config/api";
import {
  AuthResponse,
  AuthSuccessResponse,
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  AuthErrorResponse,
  AuthUser,
} from "../types";

const BASE_URL = `${API_BASE}/api/auth`;

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);
  if (!response.ok) {
    const message =
      (data as Partial<AuthErrorResponse>)?.error ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }
  return data;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJson<T>(res);
}

export async function register(
  payload: RegisterRequest
): Promise<AuthSuccessResponse> {
  return postJson<AuthSuccessResponse>(`${BASE_URL}/register`, payload);
}

export async function login(
  payload: LoginRequest
): Promise<AuthSuccessResponse> {
  return postJson<AuthSuccessResponse>(`${BASE_URL}/login`, payload);
}

export async function loginWithGoogle(
  payload: GoogleLoginRequest
): Promise<AuthSuccessResponse> {
  return postJson<AuthSuccessResponse>(`${BASE_URL}/google`, payload);
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthSuccessResponse> {
  return postJson<AuthSuccessResponse>(`${BASE_URL}/refresh`, {
    refreshToken: refreshTokenValue,
  });
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await postJson(`${BASE_URL}/logout`, { refreshToken: refreshTokenValue });
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await parseJson<{ success: boolean; user: AuthUser }>(res);
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
