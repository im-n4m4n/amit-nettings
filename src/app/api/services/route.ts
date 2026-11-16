import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getActiveServices } from "@/lib/data";
import { serviceUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getActiveServices();
  return ok({ services: rows });
}

export async function PATCH(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = serviceUpdateSchema.safeParse(body);
  if (!parsed.success) return fail("Please check the rate fields", 422, zodFieldErrors(parsed.error));

  const updated = await db
    .update(services)
    .set({
      defaultRate: parsed.data.defaultRate,
      startingPrice: parsed.data.startingPrice,
      unit: parsed.data.unit,
      warrantyMonths: parsed.data.warrantyMonths,
      isActive: parsed.data.isActive,
      tagline: parsed.data.tagline,
      updatedAt: new Date(),
    })
    .where(eq(services.slug, parsed.data.slug))
    .returning({ id: services.id });

  if (updated.length === 0) return fail("Service not found", 404);
  return ok({ slug: parsed.data.slug });
}
