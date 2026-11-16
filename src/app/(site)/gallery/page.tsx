import type { Metadata } from "next";
import { PhotoGrid, VideoGrid } from "@/components/site/media";
import { CtaBand, PageHero, SectionHead } from "@/components/site/sections";
import { getActiveServices, getSettings } from "@/lib/data";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video gallery",
  description: "Videos and photos of invisible grill, bird net and pleated mosquito net installations by Amit Nettings.",
};

export default async function GalleryPage() {
  const [services, settings, media] = await Promise.all([getActiveServices(), getSettings(), getMedia()]);
  const filters = services.map((service) => ({ slug: service.slug, name: service.name }));
  const labels = Object.fromEntries(services.map((service) => [service.slug, service.name]));
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");
  const empty = media.videos.length === 0 && media.photos.length === 0;

  return (
    <>
      <PageHero>
        <SectionHead as="h1" eyebrow="Our work" title="Video Gallery">
          Invisible grill, bird net and pleated mosquito net installations.
        </SectionHead>
      </PageHero>

      {empty && (
        <section className="section">
          <div className="shell text-center text-ink-500">New videos and photos are being added.</div>
        </section>
      )}

      {media.videos.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow={`${media.videos.length} videos`} title="Watch our installations" />
            <div className="mt-8">
              <VideoGrid items={media.videos} filters={filters} labels={labels} />
            </div>
          </div>
        </section>
      )}

      {media.photos.length > 0 && (
        <section className="section bg-sand-50">
          <div className="shell">
            <SectionHead eyebrow={`${media.photos.length} photos`} title="Our latest netting projects" />
            <div className="mt-8">
              <PhotoGrid items={media.photos} filters={filters} />
            </div>
          </div>
        </section>
      )}

      <div className={media.photos.length > 0 ? "bg-sand-50" : "pt-4"}>
        <CtaBand whatsapp={whatsapp} phone={settings.phone} />
      </div>
    </>
  );
}
