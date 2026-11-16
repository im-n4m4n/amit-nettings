"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search } from "@/components/icons";

const SORTS = [
  { value: "recent", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest value" },
  { value: "lowest", label: "Lowest value" },
];

export function EstimateFilters({ services }: { services: { slug: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [draft, setDraft] = useState(search);

  // Keep the URL in sync when the user lands with a query already applied.
  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setDraft(params.get("search") ?? "");
  }, [params]);

  const apply = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const query = next.toString();
    router.push(query ? `/dashboard/estimates?${query}` : "/dashboard/estimates");
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(draft);
    apply({ search: draft.trim() });
  };

  const hasFilters = Boolean(
    params.get("search") || params.get("service") || params.get("from") || params.get("to") || params.get("sort"),
  );

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <form onSubmit={submitSearch} className="flex-1">
          <label className="label" htmlFor="est-search">
            Search customer or phone
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="est-search"
              className="field pl-10"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Rohan Sharma or 98765…"
            />
          </div>
        </form>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:contents">
          <div className="col-span-2 sm:col-span-1">
            <label className="label" htmlFor="est-service">
              Service
            </label>
            <select
              id="est-service"
              className="field"
              value={params.get("service") ?? ""}
              onChange={(event) => apply({ service: event.target.value })}
            >
              <option value="">All services</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="est-from">
              From
            </label>
            <input
              id="est-from"
              type="date"
              className="field"
              value={params.get("from") ?? ""}
              onChange={(event) => apply({ from: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="est-to">
              To
            </label>
            <input
              id="est-to"
              type="date"
              className="field"
              value={params.get("to") ?? ""}
              onChange={(event) => apply({ to: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="est-sort">
              Sort
            </label>
            <select
              id="est-sort"
              className="field"
              value={params.get("sort") ?? "recent"}
              onChange={(event) => apply({ sort: event.target.value })}
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="chip bg-sand-100 text-ink-700">
          <Filter className="h-3 w-3" /> {hasFilters ? "Filters active" : "No filters"}
        </span>
        {hasFilters && (
          <button type="button" onClick={() => router.push("/dashboard/estimates")} className="btn btn-ghost px-3 py-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Clear all filters
          </button>
        )}
        <button type="button" onClick={submitSearch} className="btn btn-primary px-4 py-2 text-xs">
          <Search className="h-3.5 w-3.5" /> Apply search
        </button>
      </div>
    </div>
  );
}
