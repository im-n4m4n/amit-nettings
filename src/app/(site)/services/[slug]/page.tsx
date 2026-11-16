import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MessageCircle } from "@/components/icons";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PhotoGrid, VideoGrid } from "@/components/site/media";
import { Reveal } from "@/components/site/reveal";
import { CtaBand, FaqList, MapCard, SectionHead } from "@/components/site/sections";
import { ServiceIcon } from "@/components/site/service-icon";
import { faqs as allFaqs } from "@/lib/blog";
import { getActiveServices, getServiceBySlug, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/domain";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

const TOPIC: Record<string, "mosquito" | "bird" | "grill"> = {
  "mosquito-net": "mosquito",
  "bird-net": "bird",
  "invisible-grill": "grill",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service || !service.isActive) return { title: "Service not found" };
  return { title: service.name, description: service.tagline };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, services, settings, media] = await Promise.all([
    getServiceBySlug(slug),
    getActiveServices(),
    getSettings(),
    getMedia(),
  ]);
  if (!service || !service.isActive) notFound();

  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");
  const videos = media.videos.filter((item) => item.serviceSlug === service.slug);
  const photos = media.photos.filter((item) => item.serviceSlug === service.slug);
  const faqs = allFaqs.filter((faq) => faq.topic === TOPIC[service.slug]).slice(0, 6);
  const others = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-ink-900/8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="shell grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="rise text-center lg:text-left">
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400 lg:justify-start" aria-label="Breadcrumb">
              <Link href="/services" className="hover:text-brand-700">
                Services
              </Link>
              <span>/</span>
              <span className="text-brand-700">{service.name}</span>
            </nav>
            <div className="mt-5 flex flex-col items-center gap-4 lg:flex-row">
              <span className="icon-tile h-14 w-14 bg-brand-700 text-white">
                <ServiceIcon icon={service.icon} className="h-7 w-7" />
              </span>
              <h1 className="text-4xl font-extrabold sm:text-5xl">{service.name}</h1>
            </div>
            <p className="mt-5 text-lg font-medium text-ink-700">{service.tagline}</p>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-500 lg:mx-0">{service.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="#quote" className="btn btn-primary px-5 py-3.5">
                Get a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink(whatsapp, `Hello Amit Nettings, I need ${service.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp px-5 py-3.5"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
            </div>
          </div>
          <Reveal className="mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/70 bg-sand-100 shadow-lift">
              {service.image && (
                <Image
                  src={service.image}
                  alt={`${service.name} installed by Amit Nettings`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover"
                />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="quote" className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl lg:text-left">What you get</h2>
            <ul className="mt-6 space-y-3">
              {service.features.map((feature) => (
                <li key={feature} className="card flex items-start gap-3 p-4 text-sm leading-relaxed text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" weight="fill" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-center text-2xl font-extrabold sm:text-3xl lg:text-left">Frequently asked questions</h2>
                <div className="mt-6">
                  <FaqList items={faqs} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <EnquiryForm
              services={services.map((item) => ({ slug: item.slug, name: item.name }))}
              whatsapp={whatsapp}
              defaultService={service.slug}
              title={`Get a quote for ${service.name}`}
            />
            {others.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold">Other services</h3>
                <ul className="mt-4 space-y-3">
                  {others.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/services/${item.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/8 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-300 hover:bg-brand-50"
                      >
                        <span className="flex items-center gap-3">
                          <ServiceIcon icon={item.icon} className="h-5 w-5 text-brand-700" />
                          {item.name}
                        </span>
                        <ArrowRight className="h-4 w-4 text-ink-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="section bg-ink-950">
          <div className="shell">
            <SectionHead eyebrow="Videos" title={`${service.name} at work`} tone="dark" />
            <div className="mx-auto mt-10 max-w-3xl">
              <VideoGrid items={videos} labels={{ [service.slug]: service.name }} columns={3} />
            </div>
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="Photos" title="Recent projects" />
            <div className="mt-10">
              <PhotoGrid items={photos} />
            </div>
          </div>
        </section>
      )}

      <section className={`section ${photos.length > 0 ? "bg-sand-50" : ""}`}>
        <div className="shell">
          <SectionHead eyebrow="Visit us" title="Find our shop" />
          <div className="mx-auto mt-10 flex min-h-[440px] max-w-4xl">
            <MapCard
              businessName={settings.businessName}
              address={settings.address}
              city={settings.city}
              embedUrl={settings.mapEmbed}
            />
          </div>
        </div>
      </section>

      <div className={photos.length > 0 ? "bg-sand-50" : ""}>
        <CtaBand whatsapp={whatsapp} phone={settings.phone} />
      </div>
    </>
  );
}
