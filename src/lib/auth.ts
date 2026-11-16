import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySession, type SessionPayload } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ensureSeed } from "@/lib/seed";

const DEFAULT_EMAIL = process.env.ADMIN_EMAIL || "admin@amitnettings.in";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "amit@2026";
const DEFAULT_NAME = process.env.ADMIN_NAME || "Amit Kumar";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORISED");
  return session;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}

/**
 * Ensures one operator account exists. Seeds the default admin from env on first run.
 * Returns the user record for the given credentials, or null when invalid.
 */
export async function authenticate(email: string, password: string) {
  await ensureSeed();
  const normalised = email.trim().toLowerCase();
  let rows = await db.select().from(users).where(eq(users.email, normalised)).limit(1);
  if (rows.length === 0) {
    // First-run bootstrap: only when the store is empty do we accept the default operator.
    const anyUser = await db.select({ id: users.id }).from(users).limit(1);
    if (anyUser.length === 0) {
      await db.insert(users).values({
        email: normalised,
        name: DEFAULT_NAME,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        role: "admin",
        lastLoginAt: new Date(),
      });
      rows = await db.select().from(users).where(eq(users.email, normalised)).limit(1);
    }
  }
  const user = rows[0];
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  return user;
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) return { ok: false as const, error: "Account not found" };
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { ok: false as const, error: "Current password is incorrect" };
  }
  await db.update(users).set({ passwordHash: hashPassword(newPassword) }).where(eq(users.id, user.id));
  return { ok: true as const };
}
