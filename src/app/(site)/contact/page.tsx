import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "@/components/icons";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Reveal } from "@/components/site/reveal";
import { MapCard, PageHero, SectionHead } from "@/components/site/sections";
import { getActiveServices, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/domain";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or message Amit Nettings — Shop No. 3783, KKR Rd, Turbhe, Navi Mumbai.",
};

type PageProps = { searchParams: Promise<{ service?: string }> };

export default async function ContactPage({ searchParams }: PageProps) {
  const [{ service: requested }, services, settings] = await Promise.all([
    searchParams,
    getActiveServices(),
    getSettings(),
  ]);
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");
  const defaultService = services.some((service) => service.slug === requested) ? requested : "";
  const tel = `tel:${settings.phone.replace(/\s/g, "")}`;

  const cards = [
    { icon: Phone, title: "Call us", lines: [settings.phone], href: tel, cta: "Call now", external: false },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      lines: ["Send your requirement or a photo of the opening"],
      href: whatsappLink(whatsapp, "Hello Amit Nettings"),
      cta: "Open WhatsApp",
      external: true,
    },
    ...(settings.email
      ? [{ icon: Mail, title: "Email", lines: [settings.email], href: `mailto:${settings.email}`, cta: "Write an email", external: false }]
      : []),
    { icon: MapPin, title: "Visit the shop", lines: [settings.address, settings.city], href: "#map", cta: "See the map", external: false },
  ];

  return (
    <>
      <PageHero>
        <SectionHead as="h1" eyebrow="Contact" title="Contact us today">
          For enquiries, please fill out the form below. We’ll respond as soon as possible.
        </SectionHead>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={tel} className="btn btn-primary px-5 py-3.5">
            <Phone className="h-4 w-4" /> {settings.phone}
          </a>
          <a
            href={whatsappLink(whatsapp, "Hello Amit Nettings")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp px-5 py-3.5"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
        {settings.hours && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-500">
            <Clock className="h-4 w-4" /> {settings.hours}
          </p>
        )}
      </PageHero>

      <section id="quote" className="section">
        <div className="shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card, index) => (
              <Reveal key={card.title} delay={index * 60} className="h-full">
                <a
                  href={card.href}
                  target={card.external ? "_blank" : undefined}
                  rel={card.external ? "noopener noreferrer" : undefined}
                  className="card flex h-full flex-col items-center p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lift sm:items-start sm:text-left"
                >
                  <span className="icon-tile">
                    <card.icon className="h-6 w-6" weight="duotone" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold">{card.title}</h2>
                  {card.lines.filter(Boolean).map((line) => (
                    <p key={line} className="mt-1 break-words text-sm leading-relaxed text-ink-500">
                      {line}
                    </p>
                  ))}
                  <span className="mt-auto pt-4 text-sm font-semibold text-brand-700">{card.cta} →</span>
                </a>
              </Reveal>
            ))}
          </div>

          <EnquiryForm
            services={services.map((service) => ({ slug: service.slug, name: service.name }))}
            whatsapp={whatsapp}
            defaultService={defaultService}
            title="Send us a message"
            subtitle="We’ll respond as soon as possible."
          />
        </div>
      </section>

      <section id="map" className="section bg-sand-50">
        <div className="shell">
          <SectionHead eyebrow="Find us" title="Visit our shop in Turbhe" />
          <div className="mt-10 flex min-h-[460px]">
            <MapCard
              businessName={settings.businessName}
              address={settings.address}
              city={settings.city}
              embedUrl={settings.mapEmbed}
            />
          </div>
        </div>
      </section>
    </>
  );
}
