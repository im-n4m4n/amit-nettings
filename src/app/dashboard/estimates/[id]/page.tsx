import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Layers, MapPin, Pencil, Phone, Tag, User } from "@/components/icons";
import { PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { DeleteEstimateButton, ShareActions, StatusSelect } from "@/components/estimate/share-actions";
import { getSettings } from "@/lib/data";
import { getEstimate } from "@/lib/estimates";
import { BILLING_UNITS, type BillingUnit, type MeasurementUnit } from "@/lib/domain";
import { formatDateTime, formatINR, formatNumber, relativeDay } from "@/lib/format";
import { sizeLabel, type QuoteData } from "@/lib/quote";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EstimateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const estimateId = Number(id);
  if (!Number.isInteger(estimateId) || estimateId <= 0) notFound();

  const [estimate, settings] = await Promise.all([getEstimate(estimateId), getSettings()]);
  if (!estimate) notFound();

  const unit = (estimate.unit as BillingUnit) in BILLING_UNITS ? (estimate.unit as BillingUnit) : "sqft";
  const measurementUnit = (estimate.measurementUnit === "ft" ? "ft" : "in") as MeasurementUnit;
  const totalQuantity = estimate.items.reduce((sum, item) => sum + item.quantity, 0);

  const quote: QuoteData = {
    business: {
      businessName: settings.businessName,
      tagline: settings.tagline,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      gstin: settings.gstin,
      quoteTerms: settings.quoteTerms,
    },
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
    measurementUnit,
    items: estimate.items.map((item) => ({
      label: item.label,
      widthValue: item.widthValue,
      heightValue: item.heightValue,
      widthFt: item.widthFt,
      heightFt: item.heightFt,
      quantity: item.quantity,
      rate: item.rate,
      price: item.price,
    })),
    subtotal: estimate.subtotal,
    discount: estimate.discount,
    total: estimate.totalPrice,
    notes: estimate.notes,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={estimate.estimateNo}
        subtitle={`Created ${relativeDay(estimate.createdAt)} · ${formatDateTime(estimate.createdAt)}`}
        actions={
          <>
            <Link href="/dashboard/estimates" className="btn btn-ghost">
              <ArrowLeft className="h-4 w-4" /> All estimates
            </Link>
            <Link href={`/dashboard/estimates/${estimate.id}/edit`} className="btn btn-primary">
              <Pencil className="h-4 w-4" /> Edit estimate
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <div className="space-y-6">
          {/* Customer card */}
          <section className="card overflow-hidden">
            <div className="relative bg-gradient-to-br from-brand-700 to-brand-900 px-5 py-6 text-white sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white">
                    <User className="h-7 w-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-white">{estimate.customerName}</h2>
                    <div className="mt-1.5 space-y-1 text-sm text-white/85">
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> {estimate.phone}
                      </p>
                      {(estimate.address || estimate.city) && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {[estimate.address, estimate.city].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <span className="chip bg-white/15 text-white ring-1 ring-white/25">
                  <Layers className="h-3.5 w-3.5" /> {estimate.serviceName}
                </span>
              </div>
            </div>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-4 sm:px-6">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Openings</p>
                <p className="mt-1 font-display text-xl font-extrabold">{estimate.items.length}</p>
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">
                  Total {BILLING_UNITS[unit].label}
                </p>
                <p className="mt-1 font-display text-xl font-extrabold">{formatNumber(totalQuantity, 1)}</p>
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Rate basis</p>
                <p className="mt-1 font-display text-xl font-extrabold">{BILLING_UNITS[unit].short}</p>
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Grand total</p>
                <p className="mt-1 font-display text-xl font-extrabold text-brand-700">{formatINR(estimate.totalPrice)}</p>
              </div>
            </div>
          </section>

          {/* Window measurements */}
          <section className="card p-5 sm:p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-bold">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Layers className="h-4.5 w-4.5" />
                </span>
                Window measurements
              </h2>
              <span className="chip bg-brand-50 text-brand-700">Total: {estimate.items.length} windows</span>
            </header>

            <div className="mt-5 space-y-4">
              {estimate.items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-ink-900/8 bg-sand-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <span className="chip bg-white text-ink-500 ring-1 ring-ink-900/8">Measurements</span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-ink-900/8 bg-white p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Width</p>
                      <p className="mt-1 font-display font-extrabold">{sizeLabel({ ...item }, measurementUnit).split(" × ")[0]}</p>
                    </div>
                    <div className="rounded-xl border border-ink-900/8 bg-white p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Height</p>
                      <p className="mt-1 font-display font-extrabold">
                        {measurementUnit === "in"
                          ? `${formatNumber(item.heightValue, 0)} in (${item.heightFt.toFixed(2)} ft)`
                          : `${item.heightFt.toFixed(2)} ft`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-ink-900/8 bg-white p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">
                        {BILLING_UNITS[unit].label}
                      </p>
                      <p className="mt-1 font-display font-extrabold">{formatNumber(item.quantity, 1)}</p>
                    </div>
                    <div className="rounded-xl border border-ink-900/8 bg-white p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Rate</p>
                      <p className="mt-1 font-display font-extrabold">
                        {formatINR(item.rate, { decimals: true })} / {BILLING_UNITS[unit].short}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                    <span className="text-sm font-semibold text-brand-800">Line price</span>
                    <span className="font-display text-sm font-extrabold text-brand-800">
                      {formatNumber(item.quantity, 1)} × {formatINR(item.rate, { decimals: true })} ={" "}
                      <span className="rounded-lg bg-white px-2 py-1 text-base">{formatINR(item.price)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 rounded-2xl bg-ink-950 p-5 text-white sm:grid-cols-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55">Subtotal</p>
                <p className="mt-1 font-display text-xl font-extrabold">{formatINR(estimate.subtotal)}</p>
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55">Discount</p>
                <p className="mt-1 font-display text-xl font-extrabold">-{formatINR(estimate.discount)}</p>
              </div>
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55">Grand total</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-brand-300">{formatINR(estimate.totalPrice)}</p>
              </div>
            </div>
          </section>

          {estimate.notes && (
            <section className="card p-5 sm:p-6">
              <h2 className="font-bold">Site notes</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-500">{estimate.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">Share &amp; export</h2>
              <StatusBadge status={estimate.status} />
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Everything below uses the live figures from this estimate.
            </p>
            <div className="mt-4">
              <ShareActions quote={quote} />
            </div>
            <div className="mt-5 space-y-3 border-t border-ink-900/8 pt-4">
              <StatusSelect id={estimate.id} status={estimate.status} />
              <p className="flex items-center gap-2 text-xs text-ink-400">
                <CalendarDays className="h-3.5 w-3.5" /> Last updated {formatDateTime(estimate.updatedAt)}
              </p>
              <p className="flex items-center gap-2 text-xs text-ink-400">
                <Tag className="h-3.5 w-3.5" /> Rate snapshot {formatINR(estimate.rate)} / {BILLING_UNITS[unit].short}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold">Danger zone</h2>
            <p className="mt-1.5 text-xs text-ink-400">
              Deleting removes this estimate permanently. Customer records are preserved.
            </p>
            <div className="mt-4">
              <DeleteEstimateButton id={estimate.id} estimateNo={estimate.estimateNo} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
