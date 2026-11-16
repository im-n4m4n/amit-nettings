"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calculator as CalcIcon,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Share2,
  Trash2,
  Copy as CopyRow,
  MessageCircle,
  Send,
} from "@/components/icons";
import {
  BILLING_UNITS,
  computeLine,
  computeTotals,
  finalPrice,
  formatPhone,
  linePrice,
  lineQuantity,
  round2,
  toFeet,
  whatsappLink,
  type BillingUnit,
  type MeasurementUnit,
} from "@/lib/domain";
import { formatINR } from "@/lib/format";
import { buildQuoteText, type BusinessProfile, type QuoteData } from "@/lib/quote";
import { downloadQuotePdf, shareQuotePdf } from "@/lib/pdf";

export type CalcService = {
  id: number;
  slug: string;
  name: string;
  unit: string;
  defaultRate: number;
  startingPrice: number;
};

export type CalcInitial = {
  id: number;
  estimateNo: string;
  serviceSlug: string;
  status: string;
  notes: string;
  discount: number;
  rate: number;
  unit: string;
  measurementUnit: string;
  customer: { name: string; phone: string; address: string; city: string };
  items: { label: string; widthValue: number; heightValue: number; rate: number }[];
};

type ItemRow = {
  key: string;
  label: string;
  width: string;
  height: string;
  rateOverride: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

function newRow(rate: number, label: string, width = "", height = ""): ItemRow {
  return {
    key: uid(),
    label,
    width,
    height,
    rateOverride: rate > 0 ? String(rate) : "",
  };
}

export function EstimateCalculator({
  services,
  settings,
  mode,
  initial,
  initialServiceSlug,
  initialPhone,
  initialName,
}: {
  services: CalcService[];
  settings: BusinessProfile;
  mode: "app" | "public";
  initial?: CalcInitial;
  initialServiceSlug?: string;
  initialPhone?: string;
  initialName?: string;
}) {
  const router = useRouter();
  const firstService = services.find((s) => s.slug === initialServiceSlug) ?? services[0];

  const [serviceSlug, setServiceSlug] = useState(initial?.serviceSlug ?? initialServiceSlug ?? firstService?.slug ?? "");
  const [unit, setUnit] = useState<BillingUnit>(
    (initial?.unit as BillingUnit) ?? ((firstService?.unit as BillingUnit) || "sqft"),
  );
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(
    (initial?.measurementUnit as MeasurementUnit) ?? "in",
  );
  const [rate, setRate] = useState<string>(initial ? String(initial.rate ?? 0) : String(firstService?.defaultRate ?? 0));
  const [discount, setDiscount] = useState<string>(initial ? String(initial.discount ?? 0) : "0");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [customer, setCustomer] = useState({
    name: initial?.customer.name ?? initialName ?? "",
    phone: initial?.customer.phone ?? initialPhone ?? "",
    address: initial?.customer.address ?? "",
    city: initial?.customer.city ?? "",
  });

  const [items, setItems] = useState<ItemRow[]>(() => {
    if (initial?.items?.length) {
      return initial.items.map((item, index) => ({
        key: uid(),
        label: item.label || `Window ${index + 1}`,
        width: String(item.widthValue),
        height: String(item.heightValue),
        rateOverride: String(item.rate ?? initial?.rate ?? 0),
      }));
    }
    return [newRow(Number(firstService?.defaultRate ?? 0), "Window 1")];
  });

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(initial?.id ?? null);
  const [savedNo, setSavedNo] = useState<string | null>(initial?.estimateNo ?? null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const service = services.find((item) => item.slug === serviceSlug) ?? null;
  const numericRate = Number(rate) > 0 ? Number(rate) : 0;

  const rows = useMemo(() => {
    return items.map((item, index) => {
      const widthValue = Number(item.width);
      const heightValue = Number(item.height);
      const widthFt = toFeet(Number.isFinite(widthValue) ? widthValue : 0, measurementUnit);
      const heightFt = toFeet(Number.isFinite(heightValue) ? heightValue : 0, measurementUnit);
      const itemRate = Number(item.rateOverride) > 0 ? Number(item.rateOverride) : numericRate;
      const quantity = lineQuantity(unit, widthFt, heightFt);
      return {
        ...item,
        index,
        widthValue: Number.isFinite(widthValue) ? widthValue : 0,
        heightValue: Number.isFinite(heightValue) ? heightValue : 0,
        widthFt,
        heightFt,
        quantity,
        rate: itemRate,
        price: linePrice(quantity, itemRate),
        valid: widthValue > 0 && heightValue > 0 && itemRate >= 0,
      };
    });
  }, [items, measurementUnit, numericRate, unit]);

  const totals = useMemo(
    () =>
      computeTotals(
        rows.map((row) => ({
          quantity: row.quantity,
          price: row.price,
          widthFt: row.widthFt,
          heightFt: row.heightFt,
          unit,
        })),
      ),
    [rows, unit],
  );
  const discountValue = Number(discount) > 0 ? round2(Number(discount)) : 0;
  const grandTotal = finalPrice(totals.subtotal, discountValue);

  const quoteData = useMemo<QuoteData>(() => {
    return {
      business: settings,
      estimateNo: savedNo,
      createdAt: new Date().toISOString(),
      customer: {
        name: customer.name || "Customer",
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      },
      serviceName: service?.name ?? "Estimate",
      unit,
      measurementUnit,
      items: rows.map((row) => ({
        label: row.label || `Window ${row.index + 1}`,
        widthValue: row.widthValue,
        heightValue: row.heightValue,
        widthFt: row.widthFt,
        heightFt: row.heightFt,
        quantity: row.quantity,
        rate: row.rate,
        price: row.price,
      })),
      subtotal: totals.subtotal,
      discount: discountValue,
      total: grandTotal,
      notes: notes || null,
    };
  }, [settings, savedNo, customer, service, unit, measurementUnit, rows, totals.subtotal, discountValue, grandTotal, notes]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const selectService = (slug: string) => {
    setServiceSlug(slug);
    const next = services.find((item) => item.slug === slug);
    if (!next) return;
    setUnit((next.unit as BillingUnit) || "sqft");
    setRate(String(next.defaultRate || 0));
    setItems((prev) => prev.map((item) => ({ ...item, rateOverride: String(next.defaultRate || 0) })));
    setErrors({});
  };

  const updateItem = (key: string, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
    setChecked((prev) => ({ ...prev, [key]: false }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`item.${key}.width`];
      delete next[`item.${key}.height`];
      return next;
    });
  };

  const addWindow = () => {
    const last = rows[rows.length - 1];
    const width = last && last.width ? "" : "";
    setItems((prev) => [
      ...prev,
      newRow(numericRate, `Window ${prev.length + 1}`, width, ""),
    ]);
  };

  const duplicateRow = (key: string) => {
    const index = items.findIndex((item) => item.key === key);
    if (index < 0) return;
    const clone = { ...items[index], key: uid(), label: `Window ${items.length + 1}` };
    setItems((prev) => [...prev.slice(0, index + 1), clone, ...prev.slice(index + 1)]);
  };

  const removeRow = (key: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.key !== key));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((field) => {
        if (field.startsWith(`item.${key}.`)) delete next[field];
      });
      return next;
    });
  };

  const checkRow = (key: string) => {
    const row = rows.find((item) => item.key === key);
    if (!row) return;
    const nextErrors: string[] = [];
    if (!(row.widthValue > 0)) nextErrors.push(`item.${key}.width`);
    if (!(row.heightValue > 0)) nextErrors.push(`item.${key}.height`);
    if (nextErrors.length) {
      setErrors((prev) => ({
        ...prev,
        ...Object.fromEntries(
          nextErrors.map((field) => [
            field,
            field.endsWith("width") ? "Enter the width" : "Enter the height",
          ]),
        ),
      }));
      setChecked((prev) => ({ ...prev, [key]: false }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`item.${key}.width`];
      delete next[`item.${key}.height`];
      return next;
    });
    setChecked((prev) => ({ ...prev, [key]: true }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 2) next["customer.name"] = "Enter the customer name";
    const digits = customer.phone.replace(/\D/g, "").replace(/^91/, "").replace(/^0/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) next["customer.phone"] = "Enter a valid 10-digit mobile number";
    if (!serviceSlug) next.serviceSlug = "Select a service";
    if (!(numericRate > 0)) next.rate = "Enter the rate per unit";
    if (discountValue < 0) next.discount = "Discount cannot be negative";
    if (rows.length === 0) next.items = "Add at least one window";
    rows.forEach((row) => {
      if (!(row.widthValue > 0)) next[`item.${row.key}.width`] = "Width required";
      if (!(row.heightValue > 0)) next[`item.${row.key}.height`] = "Height required";
      if (!(row.rate >= 0)) next[`item.${row.key}.rate`] = "Invalid rate";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    customer: {
      name: customer.name.trim(),
      phone: customer.phone,
      address: customer.address.trim(),
      city: customer.city.trim(),
    },
    serviceSlug,
    unit,
    measurementUnit,
    rate: numericRate,
    discount: discountValue,
    status,
    notes,
    items: rows.map((row) => ({
      label: row.label || `Window ${row.index + 1}`,
      widthValue: row.widthValue,
      heightValue: row.heightValue,
      rate: row.rate,
    })),
  });

  const save = async () => {
    setFormError("");
    if (!validate()) {
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const editing = Boolean(initial?.id);
      const response = await fetch(editing ? `/api/estimates/${initial!.id}` : "/api/estimates", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        id?: number;
        estimateNo?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        if (payload.fieldErrors) setErrors((prev) => ({ ...prev, ...payload.fieldErrors }));
        setFormError(payload.error || "Could not save the estimate. Please try again.");
        return;
      }
      setSavedId(payload.id ?? null);
      setSavedNo(payload.estimateNo ?? null);
      flash(editing ? "Estimate updated" : "Estimate saved");
      router.push(`/dashboard/estimates/${payload.id}`);
    } catch {
      setFormError("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (initial?.id) {
      router.push("/dashboard/estimates/new");
      return;
    }
    setCustomer({ name: "", phone: "", address: "", city: "" });
    setItems([newRow(numericRate, "Window 1")]);
    setDiscount("0");
    setNotes("");
    setStatus("draft");
    setChecked({});
    setErrors({});
    setFormError("");
    setSavedId(null);
    setSavedNo(null);
    if (service) setRate(String(service.defaultRate));
    flash("Calculator reset");
  };

  const copyQuote = async () => {
    setBusy("copy");
    try {
      const text = buildQuoteText(quoteData);
      await navigator.clipboard.writeText(text);
      flash("Estimate copied to clipboard");
    } catch {
      setFormError("Clipboard permission denied. Select and copy the text manually.");
    } finally {
      setBusy(null);
    }
  };

  const sharePdf = async () => {
    setBusy("pdf");
    try {
      const result = await shareQuotePdf(quoteData);
      flash(result === "shared" ? "PDF shared" : "PDF downloaded");
    } catch {
      await downloadQuotePdf(quoteData);
      flash("PDF downloaded");
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async () => {
    setBusy("download");
    try {
      await downloadQuotePdf(quoteData);
      flash("PDF quotation downloaded");
    } catch {
      setFormError("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const whatsappQuote = () => {
    const text = buildQuoteText(quoteData);
    const to = customer.phone ? customer.phone : settings.whatsapp || settings.phone;
    window.open(whatsappLink(to, text), "_blank", "noopener,noreferrer");
  };

  const sendToOffice = async () => {
    setBusy("office");
    setFormError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          serviceSlug,
          address: [customer.address, customer.city].filter(Boolean).join(", "),
          message: buildQuoteText(quoteData),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!response.ok || !payload.ok) {
        if (payload.fieldErrors) setErrors((prev) => ({ ...prev, ...payload.fieldErrors }));
        setFormError(payload.error || "Could not send your request. Please try again.");
        return;
      }
      flash("Request sent — our office will confirm your quotation");
      window.open(whatsappLink(settings.whatsapp || settings.phone, buildQuoteText(quoteData)), "_blank", "noopener,noreferrer");
    } catch {
      setFormError("Network error while sending. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const fieldError = (key: string) => errors[key];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
      <div className="space-y-6">
        {/* Customer + service */}
        <section className="card p-5 sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </span>
              Estimate details
            </h2>
            {savedNo && <span className="chip bg-brand-50 text-brand-700">{savedNo}</span>}
          </header>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="calc-name">
                Customer name *
              </label>
              <input
                id="calc-name"
                className={`field ${fieldError("customer.name") ? "field-error" : ""}`}
                value={customer.name}
                onChange={(event) => {
                  setCustomer((prev) => ({ ...prev, name: event.target.value }));
                  setErrors((prev) => ({ ...prev, "customer.name": "" }));
                }}
                placeholder="Rohan Sharma"
                autoComplete="name"
              />
              {fieldError("customer.name") && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError("customer.name")}</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="calc-phone">
                Mobile number *
              </label>
              <input
                id="calc-phone"
                className={`field ${fieldError("customer.phone") ? "field-error" : ""}`}
                value={customer.phone}
                onChange={(event) => {
                  setCustomer((prev) => ({ ...prev, phone: event.target.value }));
                  setErrors((prev) => ({ ...prev, "customer.phone": "" }));
                }}
                placeholder="98765 43210"
                inputMode="tel"
                autoComplete="tel"
              />
              {fieldError("customer.phone") && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError("customer.phone")}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="calc-address">
                Site address
              </label>
              <input
                id="calc-address"
                className="field"
                value={customer.address}
                onChange={(event) => setCustomer((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Flat / building / street"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className="label" htmlFor="calc-city">
                City / area
              </label>
              <input
                id="calc-city"
                className="field"
                value={customer.city}
                onChange={(event) => setCustomer((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="Navi Mumbai"
              />
            </div>
            <div>
              <label className="label" htmlFor="calc-service">
                Service *
              </label>
              <select
                id="calc-service"
                className={`field ${fieldError("serviceSlug") ? "field-error" : ""}`}
                value={serviceSlug}
                onChange={(event) => selectService(event.target.value)}
              >
                {services.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              {fieldError("serviceSlug") && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError("serviceSlug")}</p>
              )}
            </div>
          </div>
        </section>

        {/* Windows */}
        <section className="card p-5 sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <CalcIcon className="h-4.5 w-4.5" />
              </span>
              Openings &amp; measurements
            </h2>
            <div className="inline-flex rounded-xl border border-ink-900/10 bg-sand-50 p-1">
              {(["in", "ft"] as MeasurementUnit[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMeasurementUnit(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                    measurementUnit === value ? "bg-white text-brand-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {value === "in" ? "Inches" : "Feet"}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4 space-y-4">
            {rows.map((row) => (
              <div
                key={row.key}
                className="rounded-2xl border border-ink-900/8 bg-sand-50/60 p-4 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip bg-brand-700 text-white">
                    {String(row.index + 1).padStart(2, "0")} · {row.label || `Window ${row.index + 1}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {checked[row.key] && row.valid && (
                      <span className="chip bg-brand-50 text-brand-700">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => checkRow(row.key)}
                      className="btn btn-ghost px-3 py-1.5 text-xs"
                      aria-label={`Check measurements for ${row.label}`}
                    >
                      <Check className="h-3.5 w-3.5" /> Check
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateRow(row.key)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                      aria-label="Duplicate this window"
                      title="Duplicate"
                    >
                      <CopyRow className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length <= 1}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-40"
                      aria-label="Delete this window"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`w-${row.key}`}>
                      Width ({measurementUnit === "in" ? "inches" : "feet"}) *
                    </label>
                    <input
                      id={`w-${row.key}`}
                      className={`field ${fieldError(`item.${row.key}.width`) ? "field-error" : ""}`}
                      value={row.width}
                      onChange={(event) => updateItem(row.key, { width: event.target.value })}
                      inputMode="decimal"
                      placeholder={measurementUnit === "in" ? "256" : "21.33"}
                    />
                    {fieldError(`item.${row.key}.width`) ? (
                      <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError(`item.${row.key}.width`)}</p>
                    ) : (
                      <p className="mt-1 text-xs text-ink-400">
                        {row.widthFt > 0 ? `${row.widthFt.toFixed(2)} ft` : "—"}
                        {measurementUnit === "in" && row.widthFt > 0 ? " (converted from inches)" : ""}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label" htmlFor={`h-${row.key}`}>
                      Height ({measurementUnit === "in" ? "inches" : "feet"}) *
                    </label>
                    <input
                      id={`h-${row.key}`}
                      className={`field ${fieldError(`item.${row.key}.height`) ? "field-error" : ""}`}
                      value={row.height}
                      onChange={(event) => updateItem(row.key, { height: event.target.value })}
                      inputMode="decimal"
                      placeholder={measurementUnit === "in" ? "25" : "2.08"}
                    />
                    {fieldError(`item.${row.key}.height`) ? (
                      <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError(`item.${row.key}.height`)}</p>
                    ) : (
                      <p className="mt-1 text-xs text-ink-400">
                        {row.heightFt > 0 ? `${row.heightFt.toFixed(2)} ft` : "—"}
                        {measurementUnit === "in" && row.heightFt > 0 ? " (converted from inches)" : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-ink-900/8 bg-white p-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
                      {BILLING_UNITS[unit].label}
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold text-ink-950">{round2(row.quantity)}</p>
                  </div>
                  <div>
                    <label className="label" htmlFor={`r-${row.key}`}>
                      Rate (₹ per {BILLING_UNITS[unit].short}) *
                    </label>
                    <input
                      id={`r-${row.key}`}
                      className={`field ${fieldError(`item.${row.key}.rate`) ? "field-error" : ""}`}
                      value={row.rateOverride}
                      onChange={(event) => updateItem(row.key, { rateOverride: event.target.value })}
                      inputMode="decimal"
                      placeholder={String(service?.defaultRate ?? 100)}
                    />
                  </div>
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand-700">Price</p>
                    <p className="mt-1 font-display text-lg font-extrabold text-brand-800">
                      {formatINR(row.price, { decimals: true })}
                    </p>
                    <p className="text-[0.7rem] text-brand-700/70">
                      {round2(row.quantity)} × {formatINR(row.rate, { decimals: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={addWindow} className="btn btn-ghost">
              <Plus className="h-4 w-4" /> Add another window
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          {fieldError("items") && <p className="mt-3 text-xs font-semibold text-rose-600">{fieldError("items")}</p>}
        </section>

        {/* Notes + status */}
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Notes &amp; status</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1.6fr_0.6fr]">
            <div>
              <label className="label" htmlFor="calc-notes">
                Site notes (printed on the PDF)
              </label>
              <textarea
                id="calc-notes"
                className="field min-h-[96px] resize-y"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional"
              />
            </div>
            {mode === "app" ? (
              <div>
                <label className="label" htmlFor="calc-status">
                  Status
                </label>
                <select
                  id="calc-status"
                  className="field"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-ink-900/8 bg-sand-50 p-3 text-xs text-ink-500">
                Public calculator — figures are calculated live and nothing is stored until you send it to the office.
              </div>
            )}
          </div>
          {formError && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {formError}
            </p>
          )}
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24">
        <div className="card overflow-hidden">
          <div className="bg-ink-950 p-5 text-white">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/60">Estimate summary</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{service?.name ?? "Estimate"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/60">Openings</p>
                <p className="font-display text-xl font-extrabold">{rows.length}</p>
              </div>
              <div>
                <p className="text-white/60">Total {BILLING_UNITS[unit].label}</p>
                <p className="font-display text-xl font-extrabold">{round2(totals.quantity)}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-white/60">Grand total</p>
              <p className="font-display text-3xl font-extrabold text-brand-300">
                {formatINR(grandTotal, { decimals: true })}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="calc-rate">
                  Rate (₹ / {BILLING_UNITS[unit].short}) *
                </label>
                <input
                  id="calc-rate"
                  className={`field ${fieldError("rate") ? "field-error" : ""}`}
                  value={rate}
                  onChange={(event) => {
                    setRate(event.target.value);
                    setErrors((prev) => ({ ...prev, rate: "" }));
                  }}
                  inputMode="decimal"
                />
                {fieldError("rate") && <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError("rate")}</p>}
              </div>
              <div>
                <label className="label" htmlFor="calc-unit">
                  Price basis
                </label>
                <select
                  id="calc-unit"
                  className="field"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value as BillingUnit)}
                >
                  {(Object.keys(BILLING_UNITS) as BillingUnit[]).map((key) => (
                    <option key={key} value={key}>
                      {BILLING_UNITS[key].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[0.7rem] text-ink-400">{BILLING_UNITS[unit].hint}</p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="calc-discount">
                Discount (₹)
              </label>
              <input
                id="calc-discount"
                className={`field ${fieldError("discount") ? "field-error" : ""}`}
                value={discount}
                onChange={(event) => {
                  setDiscount(event.target.value);
                  setErrors((prev) => ({ ...prev, discount: "" }));
                }}
                inputMode="decimal"
              />
              {fieldError("discount") && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{fieldError("discount")}</p>
              )}
            </div>

            <dl className="space-y-2 rounded-xl border border-ink-900/8 bg-sand-50 p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-semibold">{formatINR(totals.subtotal, { decimals: true })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Discount</dt>
                <dd className="font-semibold">-{formatINR(discountValue, { decimals: true })}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-900/8 pt-2">
                <dt className="font-bold">Payable</dt>
                <dd className="font-display text-lg font-extrabold text-brand-700">
                  {formatINR(grandTotal, { decimals: true })}
                </dd>
              </div>
            </dl>

            <div className="grid gap-2">
              {mode === "app" && (
                <button type="button" onClick={save} className="btn btn-primary w-full py-3" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {initial?.id ? "Update estimate" : "Save estimate"}
                </button>
              )}
              <button type="button" onClick={downloadPdf} className="btn btn-dark w-full py-3" disabled={busy === "download"}>
                {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF quotation
              </button>
              <button type="button" onClick={sharePdf} className="btn btn-ghost w-full py-3" disabled={busy === "pdf"}>
                {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Share PDF receipt
              </button>
              <button type="button" onClick={whatsappQuote} className="btn btn-whatsapp w-full py-3">
                <MessageCircle className="h-4 w-4" /> Send on WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={copyQuote} className="btn btn-ghost" disabled={busy === "copy"}>
                  {busy === "copy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
                {mode === "public" ? (
                  <button type="button" onClick={sendToOffice} className="btn btn-primary" disabled={busy === "office"}>
                    {busy === "office" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send to office
                  </button>
                ) : (
                  <button type="button" onClick={reset} className="btn btn-ghost">
                    <RotateCcw className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>
            </div>

            <p className="text-[0.7rem] leading-relaxed text-ink-400">
              Re-check every measurement before sharing the quotation.
            </p>
          </div>
        </div>

        {toast && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
            <CheckCircle2 className="h-4 w-4" /> {toast}
          </div>
        )}
        {customer.phone && (
          <p className="mt-3 text-center text-xs text-ink-400">Quotation will be shared on {formatPhone(customer.phone)}</p>
        )}
      </aside>
    </div>
  );
}
