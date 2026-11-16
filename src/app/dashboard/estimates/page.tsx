import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, MapPin, Phone, Plus, SquareDashedMousePointer } from "@/components/icons";
import { PageHeader } from "@/components/dashboard/ui";
import { StatusBadge } from "@/components/dashboard/ui";
import { EstimateFilters } from "@/components/dashboard/estimate-filters";
import { EstimateRowActions } from "@/components/dashboard/estimate-row-actions";
import { getActiveServices } from "@/lib/data";
import { listEstimates, type EstimateListItem } from "@/lib/estimates";
import { getSettings } from "@/lib/data";
import { buildQuoteText, type QuoteData } from "@/lib/quote";
import { BILLING_UNITS, type BillingUnit } from "@/lib/domain";
import { formatDateTime, formatINR, formatNumber, relativeDay } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ search?: string; service?: string; from?: string; to?: string; sort?: string }>;
};

function rowToQuote(estimate: EstimateListItem, items: EstimateListItem["itemCount"], business: QuoteData["business"]): QuoteData {
  const unit = (estimate.unit as BillingUnit) in BILLING_UNITS ? (estimate.unit as BillingUnit) : "sqft";
  return {
    business,
    estimateNo: estimate.estimateNo,
    createdAt: estimate.createdAt,
    customer: {
      name: estimate.customerName,
      phone: estimate.phone,
      address: estimate.address ?? "",
      city: estimate.city ?? "",
    },
    serviceName: estimate.serviceName,
    unit,
    measurementUnit: "in",
    items: [],
    subtotal: estimate.subtotal,
    discount: estimate.discount,
    total: estimate.totalPrice,
    notes: estimate.notes,
  };
}

export default async function EstimatesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const [estimates, services, settings] = await Promise.all([
    listEstimates({
      search: query.search,
      serviceSlug: query.service,
      from: query.from,
      to: query.to,
      sort: (query.sort as "recent" | undefined) ?? "recent",
    }),
    getActiveServices(),
    getSettings(),
  ]);

  const business: QuoteData["business"] = {
    businessName: settings.businessName,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    gstin: settings.gstin,
    quoteTerms: settings.quoteTerms,
  };

  const totalValue = estimates.reduce((sum, estimate) => sum + estimate.totalPrice, 0);
  const totalArea = estimates.reduce((sum, estimate) => sum + estimate.totalQuantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        subtitle={
          estimates.length === 0
            ? "No estimates match your filters yet."
            : `${estimates.length} estimate${estimates.length === 1 ? "" : "s"} · ${formatINR(totalValue)} quoted · ${formatNumber(totalArea, 1)} units measured`
        }
        actions={
          <Link href="/dashboard/estimates/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> New estimate
          </Link>
        }
      />

      <Suspense fallback={<div className="card h-40 animate-pulse" />}>
        <EstimateFilters services={services.map((service) => ({ slug: service.slug, name: service.name }))} />
      </Suspense>

      {estimates.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <SquareDashedMousePointer className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-bold">Nothing to show</h3>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            Adjust the search, service or date filters above — or create a fresh estimate with the calculator.
          </p>
          <Link href="/dashboard/estimates/new" className="btn btn-primary mt-5">
            <Plus className="h-4 w-4" /> Create estimate
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {estimates.map((estimate) => {
            const quote = rowToQuote(estimate, estimate.itemCount, business);
            void buildQuoteText;
            return (
              <li key={estimate.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/estimates/${estimate.id}`}
                        className="font-display text-lg font-extrabold hover:text-brand-700"
                      >
                        {estimate.customerName}
                      </Link>
                      <StatusBadge status={estimate.status} />
                      <span className="chip bg-sand-100 text-ink-700">{estimate.serviceName}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-ink-400">
                      {estimate.estimateNo} · created {relativeDay(estimate.createdAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-brand-600" /> {estimate.phone}
                      </span>
                      {(estimate.address || estimate.city) && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand-600" />
                          {[estimate.address, estimate.city].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-brand-600" /> {formatDateTime(estimate.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-2xl font-extrabold text-brand-700">{formatINR(estimate.totalPrice)}</p>
                    <p className="text-xs text-ink-400">
                      {formatNumber(estimate.totalQuantity, 1)} {BILLING_UNITS[estimate.unit as BillingUnit]?.label ?? estimate.unit} ·{" "}
                      {estimate.itemCount} opening{estimate.itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <EstimateRowActions
                  id={estimate.id}
                  estimateNo={estimate.estimateNo}
                  createdAt={estimate.createdAt}
                  customerName={estimate.customerName}
                  phone={estimate.phone}
                  address={estimate.address ?? ""}
                  city={estimate.city ?? ""}
                  serviceName={estimate.serviceName}
                  unit={estimate.unit}
                  rate={estimate.rate}
                  quantity={estimate.totalQuantity}
                  subtotal={estimate.subtotal}
                  discount={estimate.discount}
                  total={estimate.totalPrice}
                  notes={estimate.notes}
                  business={business}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
