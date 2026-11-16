import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { deleteCustomer, getCustomer, updateCustomer } from "@/lib/data";
import { phoneSchema } from "@/lib/validation";
import { z } from "zod";

export const dynamic = "force-dynamic";

const customerUpdateSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required").max(120),
  phone: phoneSchema,
  email: z
    .union([z.string().trim().email("Enter a valid email"), z.literal("")])
    .optional()
    .transform((v) => v ?? ""),
  address: z.string().trim().max(300).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid customer id", 400);

  const customer = await getCustomer(id);
  if (!customer) return fail("Customer not found", 404);
  return ok({ customer });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid customer id", 400);

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = customerUpdateSchema.safeParse(body);
  if (!parsed.success) return fail("Please correct the highlighted fields", 422, zodFieldErrors(parsed.error));

  const existing = await getCustomer(id);
  if (!existing) return fail("Customer not found", 404);

  try {
    await updateCustomer(id, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes,
    });
    return ok({ id });
  } catch {
    return fail("Could not update this customer. The phone number may belong to another record.", 409);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid customer id", 400);

  const estimates = await listForDelete(id);
  if (estimates > 0) {
    return fail("This customer still has estimates linked. Delete those estimates first.", 409);
  }

  await deleteCustomer(id);
  return ok({ id, deleted: true });
}

async function listForDelete(id: number) {
  const { db } = await import("@/db");
  const { estimates } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await db.select({ id: estimates.id }).from(estimates).where(eq(estimates.customerId, id)).limit(1);
  return rows.length;
}
