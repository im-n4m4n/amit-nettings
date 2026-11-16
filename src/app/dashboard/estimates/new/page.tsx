import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { EstimateCalculator, type CalcService } from "@/components/estimate/estimate-calculator";
import { PageHeader } from "@/components/dashboard/ui";
import { getActiveServices, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewEstimatePage({ searchParams }: { searchParams: Promise<{ phone?: string; service?: string; name?: string }> }) {
  const [query, services, settings] = await Promise.all([searchParams, getActiveServices(), getSettings()]);
  const calcServices: CalcService[] = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    unit: service.unit,
    defaultRate: service.defaultRate,
    startingPrice: service.startingPrice,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New estimate"
        subtitle="Enter the customer, pick a service and add every window with its width and height."
        actions={
          <Link href="/dashboard/estimates" className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" /> All estimates
          </Link>
        }
      />

      <EstimateCalculator
        services={calcServices}
        mode="app"
        initialPhone={query.phone}
        initialName={query.name}
        initialServiceSlug={query.service}
        settings={{
          businessName: settings.businessName,
          tagline: settings.tagline,
          phone: settings.phone,
          whatsapp: settings.whatsapp || settings.phone.replace(/\D/g, ""),
          email: settings.email,
          address: settings.address,
          city: settings.city,
          gstin: settings.gstin,
          quoteTerms: settings.quoteTerms,
        }}
      />
    </div>
  );
}
