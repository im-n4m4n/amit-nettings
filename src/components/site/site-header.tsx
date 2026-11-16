"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Phone, X } from "@/components/icons";
import { BrandLockup } from "@/components/site/brand";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ phone }: { phone: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl transition-shadow ${
        scrolled ? "border-ink-900/8 shadow-[0_6px_24px_-18px_rgba(4,19,26,0.45)]" : "border-transparent"
      }`}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <BrandLockup />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive(link.href) ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-sand-100 hover:text-ink-950"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-ghost hidden xl:inline-flex" aria-label="Call Amit Nettings">
            <Phone className="h-4 w-4" /> {phone}
          </a>
          <Link href="/contact#quote" className="btn btn-primary hidden sm:inline-flex">
            Get a quote <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-ink-900/10 bg-white text-ink-900 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-900/8 bg-white lg:hidden" aria-label="Mobile">
          <div className="shell flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  isActive(link.href) ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-sand-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-ghost">
                <Phone className="h-4 w-4" /> Call now
              </a>
              <Link href="/contact#quote" className="btn btn-primary">
                Get a quote
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
