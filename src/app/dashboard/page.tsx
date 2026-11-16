import Link from "next/link";
import { ArrowRight, CalendarDays, IndianRupee, Layers, Plus, Users } from "@/components/icons";
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { getDashboardStats } from "@/lib/data";
import { listEstimates } from "@/lib/estimates";
import { getSession } from "@/lib/auth";
import { formatINR, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const [session, stats, recent] = await Promise.all([getSession(), getDashboardStats(), listEstimates({ limit: 6 })]);
  const firstName = session?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Everything you quoted, measured and installed — in one workspace."
        actions={
          <>
            <Link href="/dashboard/estimates/new" className="btn btn-primary">
              <Plus className="h-4 w-4" /> New estimate
            </Link>
            <Link href="/dashboard/enquiries" className="btn btn-ghost">
              Website enquiries {stats.openEnquiries > 0 ? `(${stats.openEnquiries})` : ""}
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimates created" value={formatNumber(stats.estimates, 0)} hint={`${stats.monthEstimates} this month`} />
        <StatCard label="Quoted value" value={formatINR(stats.pipeline)} hint={`${formatINR(stats.monthPipeline)} this month`} tone="dark" />
        <StatCard label="Customers" value={formatNumber(stats.customers, 0)} hint={`${formatNumber(stats.windows, 0)} openings measured`} />
        <StatCard label="Confirmed jobs" value={formatNumber(stats.confirmedCount, 0)} hint={`${formatINR(stats.confirmedValue)} confirmed value`} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <section className="card overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-ink-900/8 px-5 py-4">
            <h2 className="font-bold">Recent estimates</h2>
            <Link href="/dashboard/estimates" className="text-sm font-semibold text-brand-700 hover:underline">
              View all <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </header>

          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No estimates yet"
                body="Create your first estimate — add a customer, pick a service and enter the window measurements in inches or feet."
                action={{ href: "/dashboard/estimates/new", label: "Create estimate" }}
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/6">
              {recent.map((estimate) => (
                <li key={estimate.id}>
                  <Link
                    href={`/dashboard/estimates/${estimate.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-sand-50"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Layers className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{estimate.customerName}</p>
                      <p className="text-xs text-ink-400">
                        {estimate.estimateNo} · {estimate.serviceName} · {estimate.itemCount} opening
                        {estimate.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-extrabold">{formatINR(estimate.totalPrice)}</p>
                      <p className="text-xs text-ink-400">{formatNumber(estimate.totalQuantity)} units</p>
                    </div>
                    <StatusBadge status={estimate.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-6">
          <div className="card p-5">
            <h2 className="font-bold">Quotes by service</h2>
            {stats.byService.length === 0 ? (
              <p className="mt-3 text-sm text-ink-400">No estimates recorded yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.byService.map((row) => (
                  <li key={row.serviceName}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{row.serviceName}</span>
                      <span className="text-ink-400">{row.count}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${Math.max(6, Math.round((row.count / Math.max(1, stats.byService[0].count)) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-ink-400">{formatINR(row.value)} quoted</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-bold">Quick actions</h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/dashboard/estimates/new"
                className="flex items-center justify-between rounded-xl border border-ink-900/8 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-brand-700" /> New estimate
                </span>
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
              <Link
                href="/dashboard/customers"
                className="flex items-center justify-between rounded-xl border border-ink-900/8 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-700" /> Customer records
                </span>
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
              <Link
                href="/dashboard/services"
                className="flex items-center justify-between rounded-xl border border-ink-900/8 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-brand-700" /> Update rates
                </span>
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
              <Link
                href="/dashboard/enquiries"
                className="flex items-center justify-between rounded-xl border border-ink-900/8 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-700" /> Enquiry inbox
                </span>
                <ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
