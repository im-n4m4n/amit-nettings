import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { getSettings, updateSettings } from "@/lib/data";
import { settingsSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return ok({ settings });
}

export async function PUT(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return fail("Please check the business details", 422, zodFieldErrors(parsed.error));

  await updateSettings(parsed.data);
  return ok({ updated: true });
}
