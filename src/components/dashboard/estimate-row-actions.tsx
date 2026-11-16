"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, MessageCircle, Pencil, Trash2 } from "@/components/icons";
import { whatsappLink } from "@/lib/domain";
import { formatINR } from "@/lib/format";

type Business = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  gstin?: string;
  quoteTerms?: string;
};

type Props = {
  id: number;
  estimateNo: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  serviceName: string;
  unit: string;
  rate: number;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  business: Business;
};

function summary(props: Props): string {
  const unit = props.unit === "pcs" ? "pcs" : props.unit === "rft" ? "r.ft" : "sq.ft";
  const lines = [
    `*${props.business.businessName}* · Estimate ${props.estimateNo}`,
    `${props.customerName} · ${props.serviceName}`,
  ];
  if (props.discount > 0) lines.push(`Discount: -${formatINR(props.discount)}`);
  lines.push(`*Total: ${props.quantity} ${unit} · ${formatINR(props.total)}*`);
  if (props.business.phone) lines.push(`Call ${props.business.phone}`);
  return lines.join("\n");
}

export function EstimateRowActions(props: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary(props));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/estimates/${props.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Could not delete");
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-900/8 pt-4">
      <Link href={`/dashboard/estimates/${props.id}`} className="btn btn-ghost">
        <Eye className="h-4 w-4" /> View
      </Link>
      <Link href={`/dashboard/estimates/${props.id}/edit`} className="btn btn-ghost">
        <Pencil className="h-4 w-4" /> Edit
      </Link>
      <button type="button" onClick={copy} className="btn btn-ghost">
        {copied ? <Check className="h-4 w-4 text-brand-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={whatsappLink(props.phone || props.business.whatsapp, summary(props))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-whatsapp"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            aria-label="Cancel"
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => !deleting && setConfirming(false)}
          />
          <div role="dialog" aria-modal="true" className="card relative w-full max-w-md p-6">
            <h3 className="text-lg font-bold">Delete estimate {props.estimateNo}?</h3>
            <p className="mt-2 text-sm text-ink-500">
              This permanently removes {props.customerName}&apos;s estimate and its window measurements.
            </p>
            {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="btn bg-rose-600 text-white hover:bg-rose-700"
              >
                <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost" disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
