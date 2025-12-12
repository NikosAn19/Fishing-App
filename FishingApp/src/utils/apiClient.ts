import { API_BASE } from "../config/api";
import { authStore } from "../features/auth/stores/authStore";
import { ApiFetchOptions } from "./types";

/** Standard JSON content type headers */
export const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

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

  // Ensure ngrok-skip-browser-warning header is present for all requests
  if (!requestInit.headers) {
    requestInit.headers = new Headers();
  }
  if (!(requestInit.headers instanceof Headers)) {
    requestInit.headers = new Headers(requestInit.headers);
  }
  const headers = requestInit.headers as Headers;
  headers.set("ngrok-skip-browser-warning", "true");

  let response = await fetch(url, requestInit);

  if (response.status === 401 && !skipAuth) {
    const newAccessToken = await attemptRefresh();
    if (newAccessToken) {
      const retryInit = await attachAuthHeader(init, skipAuth);
      // Ensure ngrok header is present on retry too
      if (!retryInit.headers) {
        retryInit.headers = new Headers();
      }
      if (!(retryInit.headers instanceof Headers)) {
        retryInit.headers = new Headers(retryInit.headers);
      }
      const retryHeaders = retryInit.headers as Headers;
      retryHeaders.set("ngrok-skip-browser-warning", "true");
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

  // Check if response is HTML (likely ngrok warning page)
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (
    contentType.includes("text/html") ||
    text.trim().startsWith("<!DOCTYPE")
  ) {
    throw new Error(
      `API returned HTML instead of JSON. This usually means ngrok is blocking the request. Response: ${text.slice(
        0,
        200
      )}`
    );
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Failed to parse API response as JSON. Response: ${text.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    let message = data?.message || response.statusText || "Request failed";
    
    // If message is still generic, and we have an error object, try to use it
    if (data?.error) {
        if (typeof data.error === 'string') {
            message = data.error;
        } else if (typeof data.error === 'object') {
            message += ` (${JSON.stringify(data.error)})`;
        }
    }
    
    throw new Error(message);
  }

  return data as T;
}
