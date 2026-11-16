import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { setEnquiryStatus } from "@/lib/data";
import { enquiryUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid enquiry id", 400);

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = enquiryUpdateSchema.safeParse(body);
  if (!parsed.success) return fail("Unknown status", 422, zodFieldErrors(parsed.error));

  await setEnquiryStatus(id, parsed.data.status);
  return ok({ id, status: parsed.data.status });
}
