import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800";

class AuthApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "string") return body;
  if (body && typeof body === "object") {
    const value = body as Record<string, unknown>;
    const message = value.message || value.error || value.title;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function createAuthError(body: unknown, status: number) {
  const message = getErrorMessage(body, "Authentication request failed.");

  if (status >= 500) {
    return new AuthApiError(`Server error (${status}): ${message}. Check the backend logs for the failing auth endpoint.`, status);
  }

  return new AuthApiError(message, status);
}

function normalizeAuthResponse(body: unknown): AuthResponse {
  if (!body || typeof body !== "object") {
    throw new AuthApiError("The server returned an empty auth response.");
  }

  const data = body as Record<string, unknown>;
  const nestedData = data.data && typeof data.data === "object" ? data.data as Record<string, unknown> : {};
  const token = data.token || data.accessToken || data.jwt || nestedData.token || nestedData.accessToken;

  if (typeof token !== "string" || token.length === 0) {
    throw new AuthApiError("The server response did not include an auth token.");
  }

  return {
    ...(nestedData as AuthResponse),
    ...(data as AuthResponse),
    token,
  };
}

async function postAuth(endpoint: string, payload: RegisterRequest | LoginRequest) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw createAuthError(body, response.status);
  }

  return normalizeAuthResponse(body);
}

export async function registerUser(payload: RegisterRequest) {
  return postAuth("/api/auth/register", payload);
}

export async function loginUser(payload: LoginRequest) {
  return postAuth("/api/auth/login", payload);
}

export async function logoutUser(accessToken: string | null) {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw createAuthError(body, response.status);
  }

  return body;
}
