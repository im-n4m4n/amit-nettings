import { fail, guard, isResponse, ok, readJson, zodFieldErrors } from "@/lib/api";
import { createGalleryItem, deleteGalleryItem, listGallery, updateGalleryItem } from "@/lib/data";
import { z } from "zod";

export const dynamic = "force-dynamic";

const gallerySchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  caption: z.string().trim().max(300).optional().default(""),
  video: z.string().trim().max(300).optional().default(""),
  poster: z.string().trim().max(300).optional().default(""),
  serviceSlug: z.string().trim().max(80).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(999).optional().default(0),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rows = await listGallery(url.searchParams.get("all") !== "1");
  return ok({ gallery: rows });
}

export async function POST(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const body = await readJson<unknown>(request);
  if (!body) return fail("Invalid request body");

  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) return fail("Please check the gallery fields", 422, zodFieldErrors(parsed.error));

  const id = await createGalleryItem(parsed.data);
  return ok({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return fail("Invalid request body");

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid gallery item id", 400);

  const parsed = gallerySchema.partial().safeParse(body);
  if (!parsed.success) return fail("Please check the gallery fields", 422, zodFieldErrors(parsed.error));

  await updateGalleryItem(id, parsed.data);
  return ok({ id });
}

export async function DELETE(request: Request) {
  const auth = await guard();
  if (isResponse(auth)) return auth;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return fail("Invalid gallery item id", 400);

  await deleteGalleryItem(id);
  return ok({ id, deleted: true });
}
