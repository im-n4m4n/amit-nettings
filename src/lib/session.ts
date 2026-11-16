import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "an_session";
const ISSUER = "amit-nettings";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

function secretKey(): Uint8Array {
  const raw =
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    `amit-nettings-dev-secret::${process.env.DATABASE_URL ?? "local"}`;
  return new TextEncoder().encode(raw.padEnd(32, "0"));
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: String(payload.sub),
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "Operator",
      role: typeof payload.role === "string" ? payload.role : "admin",
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
