"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "@/components/icons";
import { BILLING_UNITS, type BillingUnit } from "@/lib/domain";
import { formatINR } from "@/lib/format";

type ServiceRow = {
  slug: string;
  name: string;
  tagline: string;
  unit: string;
  defaultRate: number;
  startingPrice: number;
  warrantyMonths: number;
  isActive: boolean;
};

export function ServiceRateEditor({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      services.map((service) => [
        service.slug,
        {
          defaultRate: String(service.defaultRate),
          startingPrice: String(service.startingPrice),
          warrantyMonths: String(service.warrantyMonths),
          unit: service.unit as BillingUnit,
          isActive: service.isActive,
          tagline: service.tagline,
        },
      ]),
    ) as Record<string, { defaultRate: string; startingPrice: string; warrantyMonths: string; unit: BillingUnit; isActive: boolean; tagline: string }>,
  );
  const [state, setState] = useState<Record<string, "idle" | "saving" | "saved" | "error">>(
    Object.fromEntries(services.map((service) => [service.slug, "idle"])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (slug: string, patch: Partial<(typeof drafts)[string]>) => {
    setDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
    setState((prev) => ({ ...prev, [slug]: "idle" }));
    setErrors((prev) => ({ ...prev, [slug]: "" }));
  };

  const save = async (slug: string) => {
    const draft = drafts[slug];
    const defaultRate = Number(draft.defaultRate);
    const startingPrice = Number(draft.startingPrice);
    const warrantyMonths = Number(draft.warrantyMonths);
    if (!(defaultRate >= 0) || !(startingPrice >= 0) || !Number.isInteger(warrantyMonths) || warrantyMonths < 0) {
      setErrors((prev) => ({ ...prev, [slug]: "Rates must be numbers and warranty a whole number of months" }));
      setState((prev) => ({ ...prev, [slug]: "error" }));
      return;
    }

    setState((prev) => ({ ...prev, [slug]: "saving" }));
    try {
      const response = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          defaultRate,
          startingPrice,
          warrantyMonths,
          unit: draft.unit,
          isActive: draft.isActive,
          tagline: draft.tagline,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setErrors((prev) => ({ ...prev, [slug]: payload.error || "Could not save" }));
        setState((prev) => ({ ...prev, [slug]: "error" }));
        return;
      }
      setState((prev) => ({ ...prev, [slug]: "saved" }));
      router.refresh();
    } catch {
      setErrors((prev) => ({ ...prev, [slug]: "Network error" }));
      setState((prev) => ({ ...prev, [slug]: "error" }));
    }
  };

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const draft = drafts[service.slug];
        const status = state[service.slug];
        return (
          <div key={service.slug} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-extrabold">{service.name}</h3>
                  <span className="chip bg-sand-100 text-ink-600">{formatINR(service.defaultRate)} current</span>
                  {!service.isActive && <span className="chip bg-rose-50 text-rose-700">Hidden</span>}
                </div>
                <p className="mt-1 text-sm text-ink-500">{service.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => save(service.slug)}
                className="btn btn-primary"
                disabled={status === "saving"}
              >
                {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save rate
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label" htmlFor={`rate-${service.slug}`}>
                  Calculator rate (₹ / unit)
                </label>
                <input
                  id={`rate-${service.slug}`}
                  className="field"
                  value={draft.defaultRate}
                  inputMode="decimal"
                  onChange={(event) => update(service.slug, { defaultRate: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`starting-${service.slug}`}>
                  Website starting price (₹)
                </label>
                <input
                  id={`starting-${service.slug}`}
                  className="field"
                  value={draft.startingPrice}
                  inputMode="decimal"
                  onChange={(event) => update(service.slug, { startingPrice: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`unit-${service.slug}`}>
                  Price basis
                </label>
                <select
                  id={`unit-${service.slug}`}
                  className="field"
                  value={draft.unit}
                  onChange={(event) => update(service.slug, { unit: event.target.value as BillingUnit })}
                >
                  {(Object.keys(BILLING_UNITS) as BillingUnit[]).map((key) => (
                    <option key={key} value={key}>
                      {BILLING_UNITS[key].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor={`warranty-${service.slug}`}>
                  Warranty (months)
                </label>
                <input
                  id={`warranty-${service.slug}`}
                  className="field"
                  value={draft.warrantyMonths}
                  inputMode="numeric"
                  onChange={(event) => update(service.slug, { warrantyMonths: event.target.value })}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="label" htmlFor={`tagline-${service.slug}`}>
                  Short description shown on the website
                </label>
                <input
                  id={`tagline-${service.slug}`}
                  className="field"
                  value={draft.tagline}
                  onChange={(event) => update(service.slug, { tagline: event.target.value })}
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-900/20"
                  checked={draft.isActive}
                  onChange={(event) => update(service.slug, { isActive: event.target.checked })}
                />
                Show on public website
              </label>
            </div>

            {errors[service.slug] && <p className="mt-3 text-sm font-semibold text-rose-600">{errors[service.slug]}</p>}
            {status === "saved" && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">
                <Check className="h-4 w-4" /> Rate updated — the website and calculator now use these figures.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
