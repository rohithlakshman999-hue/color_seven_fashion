export const ADMIN_SESSION_COOKIE = "colour_seven_admin_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "colour-seven-dev-secret-change-me"
  );
}

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "colour7admin",
  };
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const expected = getAdminCredentials();
  const userOk =
    username.trim().toLowerCase() === expected.username.trim().toLowerCase();
  const passOk = password === expected.password;
  return userOk && passOk;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(new Uint8Array(signature));
}

export async function createAdminSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = await sign(payload);
  const raw = `${payload}:${signature}`;
  return toBase64Url(new TextEncoder().encode(raw));
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    const decoded = new TextDecoder().decode(fromBase64Url(token));
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const signature = decoded.slice(lastColon + 1);
    const expected = await sign(payload);
    if (signature !== expected) return false;
    const [, expiresStr] = payload.split(":");
    const expiresAt = Number(expiresStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return payload.startsWith("admin:");
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
