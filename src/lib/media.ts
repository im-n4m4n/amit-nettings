import { listGallery } from "@/lib/data";

export type PublicMedia = { id: number; title: string; video: string; poster: string; serviceSlug: string };

/** Published gallery items split into videos and photos, in admin-defined order. */
export async function getMedia(): Promise<{ videos: PublicMedia[]; photos: PublicMedia[] }> {
  const rows = await listGallery(true);
  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    video: row.video,
    poster: row.poster,
    serviceSlug: row.serviceSlug,
  }));
  return {
    videos: items.filter((item) => item.video),
    photos: items.filter((item) => !item.video && item.poster),
  };
}
