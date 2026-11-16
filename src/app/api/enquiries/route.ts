import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { createEnquiry, listEnquiries } from "@/lib/data";
import { enquirySchema } from "@/lib/validation";
import { getServiceBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Public: website enquiry / quotation request form. */
export async function POST(request: Request) {
  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return fail("Please check the highlighted fields", 422, zodFieldErrors(parsed.error));

  try {
    const service = parsed.data.serviceSlug ? await getServiceBySlug(parsed.data.serviceSlug) : null;
    const id = await createEnquiry({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      serviceSlug: parsed.data.serviceSlug || undefined,
      serviceName: service?.name ?? (parsed.data.serviceSlug === "other" ? "Other Service" : undefined),
      address: parsed.data.address || undefined,
      message: parsed.data.message || undefined,
    });
    return ok({ id }, { status: 201 });
  } catch (error) {
    return fail((error as Error).message || "Could not submit your enquiry", 500);
  }
}

/** Admin: list enquiries. */
export async function GET() {
  const auth = await guard();
  if (isResponse(auth)) return auth;
  const enquiries = await listEnquiries();
  return ok({ enquiries });
}
