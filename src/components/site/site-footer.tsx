import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "@/components/icons";
import { whatsappLink } from "@/lib/domain";

type FooterProps = {
  services: { slug: string; name: string }[];
  settings: {
    businessName: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    hours: string;
  };
};

const COMPANY = [
  { href: "/about", label: "About us" },
  { href: "/gallery", label: "Video gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Staff login" },
];

export function SiteFooter({ services, settings }: FooterProps) {
  const year = new Date().getFullYear();
  const heading = "text-sm font-bold uppercase tracking-[0.14em] text-white";

  return (
    <footer className="bg-ink-950 text-white/70">
      <div className="shell py-14">
        <div className="grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.3fr]">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3">
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-white/8 ring-1 ring-white/10">
                <Image src="/media/logo-mark-white.png" alt="" fill sizes="48px" className="object-contain p-2" />
              </span>
              <span className="font-display text-xl font-extrabold text-white">{settings.businessName}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {settings.tagline}. Mosquito nets, bird nets and invisible grills for homes and businesses in Navi Mumbai
              and Mumbai.
            </p>
          </div>

          <div>
            <h3 className={heading}>Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="transition-colors hover:text-brand-300">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPANY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-brand-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Reach us</h3>
            <ul className="mt-4 flex flex-col items-center gap-3 text-sm sm:items-start">
              <li>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 hover:text-brand-300">
                  <Phone className="h-4 w-4 shrink-0 text-brand-300" /> {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(settings.whatsapp || settings.phone, "Hello Amit Nettings")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 hover:text-brand-300"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-brand-300" /> WhatsApp us
                </a>
              </li>
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-3 break-all hover:text-brand-300">
                    <Mail className="h-4 w-4 shrink-0 text-brand-300" /> {settings.email}
                  </a>
                </li>
              )}
              <li className="inline-flex max-w-xs items-start gap-3 text-left">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>
                  {settings.address}, {settings.city}
                </span>
              </li>
              {settings.hours && (
                <li className="inline-flex items-center gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-brand-300" /> {settings.hours}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:justify-between">
          <span>
            © {year} {settings.businessName}. All rights reserved.
          </span>
          <span>Navi Mumbai · Mumbai</span>
        </div>
      </div>
    </footer>
  );
}
