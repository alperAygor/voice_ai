import { randomBytes } from "node:crypto";

export const GOOGLE_OAUTH_STATE_TTL_MINUTES = 10;

export function createGoogleOAuthStateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function getGoogleOAuthStateExpiry(now = new Date()): string {
  return new Date(now.getTime() + GOOGLE_OAUTH_STATE_TTL_MINUTES * 60 * 1000).toISOString();
}
