import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { createEstimate, listEstimates, type EstimateWritePayload } from "@/lib/estimates";
import { estimatePayloadSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const url = new URL(request.url);
  try {
    const items = await listEstimates({
      search: url.searchParams.get("search") ?? undefined,
      serviceSlug: url.searchParams.get("service") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      sort: (url.searchParams.get("sort") as "recent" | undefined) ?? undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    });
    return ok({ estimates: items });
  } catch (error) {
    return fail((error as Error).message || "Could not load estimates", 500);
  }
}

export async function POST(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = estimatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please correct the highlighted fields", 422, zodFieldErrors(parsed.error));
  }

  try {
    const id = await createEstimate(parsed.data as EstimateWritePayload, auth.name);
    const estimates = await import("@/lib/estimates");
    const detail = await estimates.getEstimate(id);
    return ok({ id, estimateNo: detail?.estimateNo ?? null }, { status: 201 });
  } catch (error) {
    return fail((error as Error).message || "Could not save the estimate", 500);
  }
}
