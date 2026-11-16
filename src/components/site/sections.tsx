import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, MapPin, MessageCircle, Navigation, Plus } from "@/components/icons";
import { whatsappLink } from "@/lib/domain";

export function SectionHead({
  eyebrow,
  title,
  children,
  as: Tag = "h2",
  align = "center",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  as?: "h1" | "h2";
  /** "start" = centred on phones, left-aligned from large screens (for two-column sections). */
  align?: "center" | "start";
  tone?: "light" | "dark";
}) {
  const wrap = align === "center" ? "section-head" : "mx-auto max-w-2xl text-center lg:mx-0 lg:text-left";
  return (
    <div className={wrap}>
      {eyebrow && (
        <span className={tone === "dark" ? "chip bg-white/10 text-brand-300" : "eyebrow"}>{eyebrow}</span>
      )}
      <Tag
        className={`text-balance font-extrabold ${eyebrow ? "mt-4" : ""} ${
          Tag === "h1" ? "text-4xl leading-[1.08] sm:text-5xl" : "text-3xl sm:text-4xl"
        } ${tone === "dark" ? "text-white" : ""}`}
      >
        {title}
      </Tag>
      {children && (
        <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${tone === "dark" ? "text-white/70" : "text-ink-500"}`}>
          {children}
        </p>
      )}
    </div>
  );
}

/** Soft tinted page header used at the top of inner pages. */
export function PageHero({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-ink-900/8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
      <div className="mesh-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-50 [mask-image:radial-gradient(70%_70%_at_50%_0%,black,transparent)]" />
      <div className="shell section">{children}</div>
    </section>
  );
}

/** Address + live Google Map for the shop. Falls back to an address search when no embed link is saved. */
export function MapCard({
  businessName,
  address,
  city,
  embedUrl,
}: {
  businessName: string;
  address: string;
  city: string;
  embedUrl?: string;
}) {
  const full = [address, city].filter(Boolean).join(", ");
  const src =
    embedUrl && embedUrl.startsWith("https://www.google.com/maps/embed")
      ? embedUrl
      : `https://www.google.com/maps?q=${encodeURIComponent(`${businessName}, ${full}`)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessName}, ${full}`)}`;

  return (
    <div className="card flex h-full w-full flex-col overflow-hidden">
      <div className="relative min-h-[280px] flex-1 bg-sand-100">
        <iframe
          src={src}
          title={`${businessName} on Google Maps`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-start gap-3">
          <span className="icon-tile hidden h-10 w-10 sm:grid">
            <MapPin className="h-5 w-5" weight="duotone" />
          </span>
          <p className="text-sm leading-relaxed text-ink-500">
            <span className="block font-display text-base font-bold text-ink-950">{businessName}</span>
            {full}
          </p>
        </div>
        <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-dark shrink-0">
          <Navigation className="h-4 w-4" /> Directions
        </a>
      </div>
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="card divide-y divide-ink-900/8 overflow-hidden">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-4 open:bg-brand-50/50 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.97rem] font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45 group-open:bg-white">
              <Plus className="h-4 w-4" />
            </span>
          </summary>
          <p className="mt-3 pr-10 text-sm leading-relaxed text-ink-500">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Closing gradient band. Sits inside the shell with rounded corners, so the colour is never clipped. */
export function CtaBand({ whatsapp, phone }: { whatsapp: string; phone: string }) {
  return (
    <section className="pb-16 md:pb-24">
      <div className="shell">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="mesh-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold text-white sm:text-4xl">
            Are you looking for professional netting services?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">For your house or office — call us and set up a plan.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact#quote" className="btn bg-white px-6 py-3 text-brand-800 hover:bg-brand-50">
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink(whatsapp, "Hello Amit Nettings")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/20">
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
