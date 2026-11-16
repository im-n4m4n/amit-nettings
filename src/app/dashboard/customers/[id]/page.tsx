import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone, Plus, ReceiptText, User, Users } from "@/components/icons";
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { CustomerEditForm } from "@/components/dashboard/customer-edit-form";
import { getCustomer, listCustomerEstimates } from "@/lib/data";
import { BILLING_UNITS, type BillingUnit, whatsappLink } from "@/lib/domain";
import { formatDateTime, formatINR, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId) || customerId <= 0) notFound();

  const customer = await getCustomer(customerId);
  if (!customer) notFound();

  const estimates = await listCustomerEstimates(customerId);
  const quotedValue = estimates.reduce((sum, estimate) => sum + estimate.totalPrice, 0);
  const totalUnits = estimates.reduce((sum, estimate) => sum + estimate.totalQuantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        subtitle={`Customer #${customer.id} · added ${formatDateTime(customer.createdAt)}`}
        actions={
          <>
            <Link href="/dashboard/customers" className="btn btn-ghost">
              <ArrowLeft className="h-4 w-4" /> All customers
            </Link>
            <a
              href={whatsappLink(customer.phone, `Hello ${customer.name}, this is Amit Nettings.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Link href={`/dashboard/estimates/new?phone=${encodeURIComponent(customer.phone)}`} className="btn btn-primary">
              <Plus className="h-4 w-4" /> New estimate
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimates" value={formatNumber(estimates.length, 0)} hint="All quotations on record" />
        <StatCard label="Lifetime quoted" value={formatINR(quotedValue)} tone="dark" hint="Sum of every estimate" />
        <StatCard label="Units measured" value={formatNumber(totalUnits, 1)} hint="Sq.ft / R.ft / pieces" />
        <StatCard label="Contact" value={customer.phone} hint={customer.email ?? "No email on file"} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <CustomerEditForm
          customer={{
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            city: customer.city,
            notes: customer.notes,
          }}
        />

        <section className="card overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-ink-900/8 px-5 py-4">
            <h2 className="flex items-center gap-2 font-bold">
              <ReceiptText className="h-4.5 w-4.5 text-brand-700" /> Estimate history
            </h2>
            <span className="chip bg-brand-50 text-brand-700">{estimates.length}</span>
          </header>

          {estimates.length === 0 ? (
            <div className="flex flex-col items-center p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Users className="h-6 w-6" />
              </span>
              <p className="mt-3 font-semibold">No estimates yet</p>
              <p className="mt-1 text-sm text-ink-500">Create the first quotation for this customer.</p>
              <Link href={`/dashboard/estimates/new?phone=${encodeURIComponent(customer.phone)}`} className="btn btn-primary mt-4">
                <Plus className="h-4 w-4" /> New estimate
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {estimates.map((estimate) => (
                <li key={estimate.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/dashboard/estimates/${estimate.id}`} className="font-display font-extrabold hover:text-brand-700">
                        {estimate.estimateNo}
                      </Link>
                      <p className="mt-1 text-xs text-ink-400">{formatDateTime(estimate.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-extrabold text-brand-700">{formatINR(estimate.totalPrice)}</p>
                      <p className="text-xs text-ink-400">
                        {formatNumber(estimate.totalQuantity, 1)}{" "}
                        {BILLING_UNITS[(estimate.unit as BillingUnit) as keyof typeof BILLING_UNITS]?.label ?? estimate.unit}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="chip bg-sand-100 text-ink-700">{estimate.serviceName}</span>
                    <StatusBadge status={estimate.status} />
                    <Link href={`/dashboard/estimates/${estimate.id}`} className="btn btn-ghost ml-auto px-3 py-1.5 text-xs">
                      Open receipt
                    </Link>
                    <a
                      href={whatsappLink(customer.phone, `Hello ${customer.name}, your estimate ${estimate.estimateNo} total is ${formatINR(estimate.totalPrice)}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp px-3 py-1.5 text-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Share
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <User className="h-4.5 w-4.5 text-brand-700" /> Contact card
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Phone</p>
            <a href={`tel:${customer.phone}`} className="mt-1 inline-flex items-center gap-1.5 font-semibold hover:text-brand-700">
              <Phone className="h-3.5 w-3.5 text-brand-600" /> {customer.phone}
            </a>
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Email</p>
            <p className="mt-1">{customer.email || "—"}</p>
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">Address</p>
            <p className="mt-1">{customer.address || "—"}</p>
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-400">City</p>
            <p className="mt-1">{customer.city || "—"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
