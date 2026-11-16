import { z } from "zod";
import { authenticate, clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { fail, ok, readJson, zodFieldErrors } from "@/lib/api";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check your credentials", 422, zodFieldErrors(parsed.error));
  }

  try {
    const user = await authenticate(parsed.data.email, parsed.data.password);
    if (!user) return fail("Invalid email or password", 401);
    await setSessionCookie({ sub: String(user.id), email: user.email, name: user.name, role: user.role });
    return ok({ email: user.email, name: user.name });
  } catch {
    return fail("Login failed. Please try again.", 500);
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return ok({ signedOut: true });
}

export type LoginInput = z.input<typeof loginSchema>;
