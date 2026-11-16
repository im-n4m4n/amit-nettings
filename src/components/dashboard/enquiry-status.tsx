"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "@/components/icons";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const TONE: Record<string, string> = {
  new: "bg-sky-50 text-sky-700 ring-sky-200",
  contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function EnquiryStatusSelect({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const change = async (next: string) => {
    const previous = value;
    setBusy(true);
    setValue(next);
    setError("");
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setValue(previous);
        setError(payload.error || "Could not update status");
        return;
      }
      router.refresh();
    } catch {
      setValue(previous);
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className={`field py-2 text-sm ${TONE[value] ?? ""}`}
        value={value}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        aria-label="Enquiry status"
      >
        {STATUSES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {busy && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
      {!busy && !error && value !== status && <Check className="h-4 w-4 text-brand-600" />}
      {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
    </div>
  );
}
