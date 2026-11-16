import { PageHeader } from "@/components/dashboard/ui";
import { GalleryManager } from "@/components/dashboard/gallery-manager";
import { getServices, listGallery } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardGalleryPage() {
  const [items, services] = await Promise.all([listGallery(false), getServices()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video & photo gallery"
        subtitle="Manage the installation media shown on the public gallery page. Items are published instantly."
      />
      <GalleryManager
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption,
          video: item.video,
          poster: item.poster,
          serviceSlug: item.serviceSlug,
          location: item.location,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        }))}
        services={services.map((service) => ({ slug: service.slug, name: service.name }))}
      />
    </div>
  );
}
