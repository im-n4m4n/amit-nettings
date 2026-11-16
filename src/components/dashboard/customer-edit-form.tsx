"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Save, Trash2 } from "@/components/icons";

type Props = {
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    city: string | null;
    notes: string | null;
  };
};

const FIELDS = [
  { key: "name", label: "Customer name", placeholder: "Rohan Sharma" },
  { key: "phone", label: "Mobile number", placeholder: "98765 43210" },
  { key: "email", label: "Email (optional)", placeholder: "rohan@email.com" },
  { key: "city", label: "City / area", placeholder: "Navi Mumbai" },
] as const;

export function CustomerEditForm({ customer }: Props) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    city: customer.city ?? "",
    address: customer.address ?? "",
    notes: customer.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const set = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus("idle");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const local: Record<string, string> = {};
    if (values.name.trim().length < 2) local.name = "Enter the customer name";
    const digits = values.phone.replace(/\D/g, "").replace(/^91/, "").replace(/^0/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) local.phone = "Enter a valid 10-digit mobile number";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) local.email = "Enter a valid email";
    setErrors(local);
    if (Object.keys(local).length) return;

    setStatus("saving");
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!response.ok || !payload.ok) {
        if (payload.fieldErrors) setErrors(payload.fieldErrors);
        setError(payload.error || "Could not save this customer");
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Network error while saving");
      setStatus("error");
    }
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setDeleteError(payload.error || "Could not delete this customer");
        return;
      }
      router.push("/dashboard/customers");
      router.refresh();
    } catch {
      setDeleteError("Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="card p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Customer record</h2>
        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </header>
      <p className="mt-1.5 text-sm text-ink-500">
        Changes here update the customer across every estimate and PDF quotation.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="label" htmlFor={`cust-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`cust-${field.key}`}
              className={`field ${errors[field.key] ? "field-error" : ""}`}
              value={values[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => set(field.key, event.target.value)}
            />
            {errors[field.key] && <p className="mt-1 text-xs font-semibold text-rose-600">{errors[field.key]}</p>}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="cust-address">
            Site address
          </label>
          <input
            id="cust-address"
            className="field"
            value={values.address}
            placeholder="Shop No. 3783, KKR Rd, Turbhe"
            onChange={(event) => set("address", event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="cust-notes">
            Internal notes (never printed on quotations)
          </label>
          <textarea
            id="cust-notes"
            className="field min-h-[90px] resize-y"
            value={values.notes}
            placeholder="Prefers evening visits. Gate code 4213."
            onChange={(event) => set("notes", event.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      {status === "saved" && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
          <Check className="h-4 w-4" /> Customer record updated.
        </p>
      )}

      <div className="mt-6 border-t border-ink-900/8 pt-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink-400">Danger zone</h3>
        {confirmDelete ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">Delete {customer.name} permanently?</p>
            {deleteError && <p className="mt-2 text-xs font-semibold text-rose-700">{deleteError}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={remove} className="btn bg-rose-600 text-white hover:bg-rose-700" disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Yes, delete customer
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-ghost" disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="btn mt-3 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
            <Trash2 className="h-4 w-4" /> Delete customer
          </button>
        )}
      </div>
    </form>
  );
}
