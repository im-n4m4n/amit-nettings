import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { changePassword, getSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const session = await getSession();
  if (!session) return fail("Session expired. Please sign in again.", 401);

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return fail("Please check the password fields", 422, zodFieldErrors(parsed.error));

  const result = await changePassword(Number(session.sub), parsed.data.currentPassword, parsed.data.newPassword);
  if (!result.ok) return fail(result.error, 400);
  return ok({ updated: true });
}
