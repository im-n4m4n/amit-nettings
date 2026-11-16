import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { getActiveServices, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [services, settings] = await Promise.all([getActiveServices(), getSettings()]);
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader phone={settings.phone} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        services={services.map((service) => ({ slug: service.slug, name: service.name }))}
        settings={{
          businessName: settings.businessName,
          tagline: settings.tagline,
          phone: settings.phone,
          whatsapp,
          email: settings.email,
          address: settings.address,
          city: settings.city,
          hours: settings.hours,
        }}
      />
      <WhatsAppFab phone={whatsapp} />
    </div>
  );
}
