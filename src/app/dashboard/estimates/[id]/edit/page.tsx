import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
import { EstimateCalculator, type CalcService } from "@/components/estimate/estimate-calculator";
import { PageHeader } from "@/components/dashboard/ui";
import { getActiveServices, getSettings } from "@/lib/data";
import { getEstimate } from "@/lib/estimates";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEstimatePage({ params }: PageProps) {
  const { id } = await params;
  const estimateId = Number(id);
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  const [estimate, services, settings] = await Promise.all([
    getEstimate(estimateId),
    getActiveServices(),
    getSettings(),
  ]);
  if (!estimate) notFound();

  const calcServices: CalcService[] = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    unit: service.unit,
    defaultRate: service.defaultRate,
    startingPrice: service.startingPrice,
  }));

  const serviceSlug =
    services.find((service) => service.name === estimate.serviceName)?.slug ??
    (services.find((service) => String(service.id) === estimate.serviceSlug)?.slug ?? services[0]?.slug ?? "");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${estimate.estimateNo}`}
        subtitle={`${estimate.customerName} · ${estimate.serviceName} · ${estimate.items.length} openings`}
        actions={
          <Link href={`/dashboard/estimates/${estimate.id}`} className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Back to estimate
          </Link>
        }
      />

      <EstimateCalculator
        services={calcServices}
        mode="app"
        initial={{
          id: estimate.id,
          estimateNo: estimate.estimateNo,
          serviceSlug,
          status: estimate.status,
          notes: estimate.notes ?? "",
          discount: estimate.discount,
          rate: estimate.rate,
          unit: estimate.unit,
          measurementUnit: estimate.measurementUnit,
          customer: {
            name: estimate.customerName,
            phone: estimate.phone,
            address: estimate.address ?? "",
            city: estimate.city ?? "",
          },
          items: estimate.items.map((item) => ({
            label: item.label,
            widthValue: item.widthValue,
            heightValue: item.heightValue,
            rate: item.rate,
          })),
        }}
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
