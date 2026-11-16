import { ZodError } from "zod";
import { getSession } from "@/lib/auth";

export function ok<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, ...data }, init);
}

export function fail(error: string, status = 400, fieldErrors?: Record<string, string>) {
  return Response.json({ ok: false, error, fieldErrors }, { status });
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (!result[path]) result[path] = issue.message;
  }
  return result;
}

export async function guard(): Promise<{ email: string; name: string } | Response> {
  const session = await getSession();
  if (!session) return fail("You must be signed in to do that.", 401);
  return { email: session.email, name: session.name };
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
