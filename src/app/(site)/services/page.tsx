import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Handshake, Heart, Leaf, Medal, Tag } from "@/components/icons";
import { PhotoGrid } from "@/components/site/media";
import { Reveal } from "@/components/site/reveal";
import { CtaBand, PageHero, SectionHead } from "@/components/site/sections";
import { ServiceIcon } from "@/components/site/service-icon";
import { getActiveServices, getSettings } from "@/lib/data";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Pleated and sliding mosquito nets, bird / pigeon nets and invisible safety grills by Amit Nettings.",
};

const REASONS = [
  { icon: Medal, label: "Quality service" },
  { icon: Tag, label: "Best price" },
  { icon: Cpu, label: "Advanced technology" },
  { icon: Handshake, label: "Trusted professional" },
  { icon: Heart, label: "Healthy" },
  { icon: Leaf, label: "Eco-friendly" },
];

export default async function ServicesPage() {
  const [services, settings, media] = await Promise.all([getActiveServices(), getSettings(), getMedia()]);
  const filters = services.map((service) => ({ slug: service.slug, name: service.name }));
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");

  return (
    <>
      <PageHero>
        <SectionHead as="h1" eyebrow="Services" title="We provide the best services">
          High-quality mosquito net solutions, pigeon net installations and invisible grills for homes and businesses.
        </SectionHead>
      </PageHero>

      <section className="section">
        <div className="shell space-y-8">
          {services.map((service, index) => (
            <Reveal key={service.slug}>
              <article className="card grid overflow-hidden lg:grid-cols-2">
                <div className={`relative aspect-[16/11] bg-brand-50 lg:aspect-auto lg:min-h-[360px] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  {service.image && (
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-9">
                  <div className="flex items-center gap-4">
                    <span className="icon-tile">
                      <ServiceIcon icon={service.icon} />
                    </span>
                    <h2 className="text-2xl font-extrabold sm:text-3xl">{service.name}</h2>
                  </div>
                  <p className="mt-4 leading-relaxed text-ink-500">{service.description}</p>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {service.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm leading-snug text-ink-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" weight="fill" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href={`/contact?service=${service.slug}#quote`} className="btn btn-primary">
                      Order now <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href={`/services/${service.slug}`} className="btn btn-ghost">
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section bg-sand-50">
        <div className="shell">
          <SectionHead eyebrow="Why choose us?" title="Welcome to Amit Nettings">
            We’re the best choice for keeping your home safe and comfortable. Here’s why:
          </SectionHead>
          <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
            {REASONS.map((reason) => (
              <li key={reason.label} className="card flex flex-col items-center gap-3 p-5 text-center">
                <span className="icon-tile">
                  <reason.icon className="h-6 w-6" weight="duotone" />
                </span>
                <span className="text-sm font-bold text-ink-950">{reason.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {media.photos.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="Photo gallery" title="Our latest netting projects" />
            <div className="mt-10">
              <PhotoGrid items={media.photos} filters={filters} />
            </div>
          </div>
        </section>
      )}

      <CtaBand whatsapp={whatsapp} phone={settings.phone} />
    </>
  );
}
