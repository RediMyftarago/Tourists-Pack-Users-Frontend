import type { AuthResponse, SessionUser, StoredAccount } from "./types";

export const ACCOUNT_KEY = "vodafone-auth-account";
export const SESSION_KEY = "vodafone-auth-session";
export const AUTH_EVENT = "vodafone-auth-change";
export const TOKEN_KEY = "vodafone-auth-token";

export function publishSession(user: SessionUser) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
}

export function saveAuthToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function saveStoredAccount(account: StoredAccount) {
  sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function clearCustomerSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ACCOUNT_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function hasCustomerSession() {
  const storedSession = sessionStorage.getItem(SESSION_KEY);
  const storedToken = sessionStorage.getItem(TOKEN_KEY);

  if (!storedSession || !storedToken) return false;

  try {
    const session = JSON.parse(storedSession) as SessionUser;
    return session.type === "customer";
  } catch {
    return false;
  }
}

export function createSessionFromAuthResponse(
  fallback: StoredAccount,
  response: AuthResponse,
): SessionUser {
  const responseUser = response.user;
  const name =
    responseUser?.firstName ||
    response.firstName ||
    responseUser?.name ||
    response.name ||
    responseUser?.fullName ||
      response.fullName ||
      fallback.firstName;
  const id = response.user?.id || response.user?.userId || response.userId;

  return {
    id,
    name,
    email: responseUser?.email || response.email || fallback.email,
    phone: responseUser?.phoneNumber || response.phoneNumber || responseUser?.phone || response.phone || fallback.phone,
    type: "customer",
  };
}

export function getAuthRole(response: AuthResponse) {
  return String(response.user?.roles || response.user?.role || response.roles || response.role || "").toUpperCase();
}

export function isAdminAuthResponse(response: AuthResponse) {
  return getAuthRole(response).includes("ADMIN");
}
