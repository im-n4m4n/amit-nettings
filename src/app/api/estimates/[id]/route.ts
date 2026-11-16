import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import {
  deleteEstimate,
  getEstimate,
  updateEstimate,
  updateEstimateStatus,
  type EstimateWritePayload,
} from "@/lib/estimates";
import { estimatePayloadSchema } from "@/lib/validation";
import { isEstimateStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = parseId((await params).id);
  if (!id) return fail("Invalid estimate id", 400);

  const estimate = await getEstimate(id);
  if (!estimate) return fail("Estimate not found", 404);
  return ok({ estimate });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = parseId((await params).id);
  if (!id) return fail("Invalid estimate id", 400);

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return fail("Invalid request body");

  // Status-only update from the estimate list / detail view.
  if (body.status && Object.keys(body).length === 1) {
    if (!isEstimateStatus(body.status)) return fail("Unknown status", 422);
    const updated = await updateEstimateStatus(id, body.status);
    if (!updated) return fail("Estimate not found", 404);
    return ok({ id, status: body.status });
  }

  const parsed = estimatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please correct the highlighted fields", 422, zodFieldErrors(parsed.error));
  }

  const updated = await updateEstimate(id, parsed.data as EstimateWritePayload, auth.name);
  if (!updated) return fail("Estimate not found", 404);
  return ok({ id, estimateNo: (await getEstimate(id))?.estimateNo ?? null });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = parseId((await params).id);
  if (!id) return fail("Invalid estimate id", 400);

  const deleted = await deleteEstimate(id);
  if (!deleted) return fail("Estimate not found", 404);
  return ok({ id, deleted: true });
}
