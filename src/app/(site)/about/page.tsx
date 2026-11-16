import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, Medal, Phone, Toolbox, Wallet } from "@/components/icons";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Reveal } from "@/components/site/reveal";
import { MapCard, SectionHead } from "@/components/site/sections";
import { getActiveServices, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Amit Nettings specialises in mosquito net solutions, pigeon net installations and invisible grills in Navi Mumbai and Mumbai.",
};

const OFFERINGS = [
  { title: "Aluminium Sliding Mosquito Nets", body: "Stylish and durable solutions to keep insects out." },
  { title: "Pleated Mosquito Nets", body: "Modern and space-saving designs for doors and windows." },
  { title: "Pigeon Nets for Balconies", body: "Strong and weather-resistant nets to prevent bird intrusions." },
  { title: "Invisible Grills", body: "Secure, sleek, and rust-free grills for high-rise safety without blocking the view." },
];

const REASONS = [
  { icon: Toolbox, title: "Expert Installation", body: "Our trained professionals ensure a hassle-free and precise installation." },
  { icon: Medal, title: "High-Quality Materials", body: "We use premium-grade nets and grills for long-lasting protection." },
  { icon: Wallet, title: "Affordable Pricing", body: "Get the best quality at competitive prices." },
  { icon: HandHeart, title: "Customer Satisfaction", body: "Our focus is on delivering excellent service and durable solutions." },
];

export default async function AboutPage() {
  const [services, settings] = await Promise.all([getActiveServices(), getSettings()]);
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-ink-900/8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="shell grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="rise">
            <SectionHead as="h1" eyebrow="About us" title="Who We Are" align="start">
              At Amit Nettings, we specialize in providing high-quality mosquito net solutions, pigeon net
              installations, and invisible grills to ensure safety and comfort for homes and businesses.
            </SectionHead>
            <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-ink-500 lg:mx-0 lg:text-left">
              Based in Navi Mumbai and Mumbai, we take pride in delivering durable, aesthetically pleasing, and
              cost-effective products tailored to our customers’ needs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="#quote" className="btn btn-primary px-5 py-3.5">
                Get a free appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn btn-ghost px-5 py-3.5">
                <Phone className="h-4 w-4" /> {settings.phone}
              </a>
            </div>
          </div>
          <Reveal className="mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3.3] overflow-hidden rounded-[1.75rem] border border-white/70 bg-sand-100 shadow-lift">
              <Image
                src="/media/photos/mosquito-install.jpg"
                alt="Amit Nettings technician installing a mosquito net"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Our services" title="What we install" />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERINGS.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className="h-full">
                <li className="card h-full list-none p-6">
                  <span className="font-display text-3xl font-extrabold text-brand-600">0{index + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-sand-50">
        <div className="shell">
          <SectionHead eyebrow="Why choose us?" title="Service you can rely on" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className="h-full">
                <li className="card h-full list-none p-6 text-center">
                  <span className="icon-tile icon-tile-dark mx-auto">
                    <item.icon className="h-6 w-6" weight="duotone" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="quote" className="section">
        <div className="shell">
          <SectionHead eyebrow="Call us and set up a plan" title="Sit back and relax">
            Are you looking for professional netting services for your house or office?
          </SectionHead>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <EnquiryForm
              services={services.map((service) => ({ slug: service.slug, name: service.name }))}
              whatsapp={whatsapp}
              title="Get a free appointment"
            />
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
