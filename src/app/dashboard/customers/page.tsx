import Link from "next/link";
import { MessageCircle, Phone, Search, SquareDashedMousePointer, Users } from "@/components/icons";
import { PageHeader } from "@/components/dashboard/ui";
import { listCustomers } from "@/lib/data";
import { formatDate, formatINR } from "@/lib/format";
import { whatsappLink } from "@/lib/domain";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ search?: string }> };

export default async function CustomersPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const customers = await listCustomers(search);
  const totalValue = customers.reduce((sum, customer) => sum + customer.totalValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer records"
        subtitle={
          customers.length === 0
            ? "No customers stored yet."
            : `${customers.length} customer${customers.length === 1 ? "" : "s"} · ${formatINR(totalValue)} lifetime quoted value`
        }
      />

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4 sm:p-5">
        <div className="flex-1">
          <label className="label" htmlFor="customer-search">
            Search by name, phone or address
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="customer-search"
              name="search"
              defaultValue={search ?? ""}
              className="field pl-10"
              placeholder="Rohan Sharma, 98765…"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          <Search className="h-4 w-4" /> Search
        </button>
        {search && (
          <Link href="/dashboard/customers" className="btn btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {customers.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Users className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-bold">No customer records</h3>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            Customers are created automatically when you save an estimate. Once you raise a quotation, their details
            appear here with the quoted value.
          </p>
          <Link href="/dashboard/estimates/new" className="btn btn-primary mt-5">
            Create an estimate
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sand-50 text-[0.68rem] uppercase tracking-[0.14em] text-ink-400">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Customer</th>
                  <th className="px-5 py-3.5 font-bold">Contact</th>
                  <th className="px-5 py-3.5 font-bold">Location</th>
                  <th className="px-5 py-3.5 text-right font-bold">Estimates</th>
                  <th className="px-5 py-3.5 text-right font-bold">Quoted value</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/6">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-sand-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-ink-400">Added {formatDate(customer.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-500">
                      <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                        <Phone className="h-3.5 w-3.5 text-brand-600" /> {customer.phone}
                      </a>
                      {customer.email && <p className="mt-1 text-xs">{customer.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-ink-500">
                      {[customer.address, customer.city].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {customer.estimateCount}
                      {customer.estimateCount > 0 && (
                        <Link
                          href={`/dashboard/estimates?search=${encodeURIComponent(customer.phone)}`}
                          className="ml-2 text-xs font-semibold text-brand-700 hover:underline"
                        >
                          view
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-display font-extrabold text-brand-700">
                      {formatINR(customer.totalValue)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={whatsappLink(customer.phone, `Hello ${customer.name}, this is Amit Nettings.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          aria-label={`WhatsApp ${customer.name}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/dashboard/estimates/new`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/10 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                          aria-label={`New estimate for ${customer.name}`}
                          title="New estimate"
                        >
                          +
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && (
            <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-ink-400">
              <SquareDashedMousePointer className="h-4 w-4" /> No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
