import { API_BASE } from "../config/api";
import { authStore } from "../features/auth/stores/authStore";

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  parseJson?: boolean;
};

async function attachAuthHeader(
  init: RequestInit,
  skipAuth?: boolean
): Promise<RequestInit> {
  if (skipAuth) return init;

  const state = authStore.getState();
  const headers = new Headers(init.headers || {});

  if (state.accessToken) {
    headers.set("Authorization", `Bearer ${state.accessToken}`);
  }

  return {
    ...init,
    headers,
  };
}

async function attemptRefresh(): Promise<string | null> {
  const refreshTokens = authStore.getState().refreshTokens;
  return refreshTokens();
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth, parseJson = false, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const requestInit = await attachAuthHeader(init, skipAuth);

  let response = await fetch(url, requestInit);

  if (response.status === 401 && !skipAuth) {
    const newAccessToken = await attemptRefresh();
    if (newAccessToken) {
      const retryInit = await attachAuthHeader(init, skipAuth);
      response = await fetch(url, retryInit);
    }
  }

  if (parseJson) {
    // Force body consumption for callers who only care about side effects
    await response
      .clone()
      .json()
      .catch(() => undefined);
  }

  return response;
}

export async function apiFetchJson<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    const message = data?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data as T;
}
