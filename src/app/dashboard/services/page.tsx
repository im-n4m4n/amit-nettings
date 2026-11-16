import { PageHeader } from "@/components/dashboard/ui";
import { ServiceRateEditor } from "@/components/dashboard/service-rate-editor";
import { getServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services & rates"
        subtitle="Rates edited here drive the public rate card, the instant calculator and every new estimate."
      />
      <ServiceRateEditor
        services={services.map((service) => ({
          slug: service.slug,
          name: service.name,
          tagline: service.tagline,
          unit: service.unit,
          defaultRate: service.defaultRate,
          startingPrice: service.startingPrice,
          warrantyMonths: service.warrantyMonths,
          isActive: service.isActive,
        }))}
      />
    </div>
  );
}
