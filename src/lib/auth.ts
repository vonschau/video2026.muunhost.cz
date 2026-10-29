import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "spravce_session";
const SESSION_MS = 12 * 60 * 60 * 1000;

export function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

export function passwordsMatch(given: string, expected: string): boolean {
  const left = createHash("sha256").update(given).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function createSessionToken(): string {
  const password = adminPassword();
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set");
  }

  const payload = `v1.${Date.now() + SESSION_MS}`;
  const signature = createHmac("sha256", password).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MS / 1000,
  };
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function verifySessionToken(token: string): boolean {
  const password = adminPassword();
  if (!password) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;

  const payload = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  if (!signature || !/^[0-9a-f]{64}$/.test(signature)) return false;

  const expected = createHmac("sha256", password).update(payload).digest("hex");
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;

  const expiresAt = Number(parts[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export { COOKIE_NAME };
