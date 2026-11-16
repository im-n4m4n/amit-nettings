"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Share2,
  Trash2,
} from "@/components/icons";
import { buildQuoteText, type QuoteData } from "@/lib/quote";
import { downloadQuotePdf, shareQuotePdf } from "@/lib/pdf";
import { whatsappLink } from "@/lib/domain";
import { ESTIMATE_STATUS, type EstimateStatus } from "@/lib/domain";

export function ShareActions({ quote, compact = false }: { quote: QuoteData; compact?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  };

  const copy = async () => {
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(buildQuoteText(quote));
      flash("Copied to clipboard");
    } catch {
      flash("Clipboard blocked by the browser");
    } finally {
      setBusy(null);
    }
  };

  const whatsapp = () => {
    window.open(whatsappLink(quote.customer.phone || quote.business.whatsapp, buildQuoteText(quote)), "_blank", "noopener,noreferrer");
  };

  const download = async () => {
    setBusy("download");
    try {
      await downloadQuotePdf(quote);
      flash("PDF downloaded");
    } catch {
      flash("Could not build the PDF");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    setBusy("share");
    try {
      const result = await shareQuotePdf(quote);
      flash(result === "shared" ? "Shared" : "PDF downloaded");
    } catch {
      flash("Sharing cancelled");
    } finally {
      setBusy(null);
    }
  };

  const buttons = [
    {
      key: "copy",
      label: "Copy details",
      icon: busy === "copy" ? Loader2 : Copy,
      onClick: copy,
      className: "btn btn-ghost",
      spin: busy === "copy",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: whatsapp,
      className: "btn btn-whatsapp",
      spin: false,
    },
    {
      key: "download",
      label: "Download PDF",
      icon: busy === "download" ? Loader2 : Download,
      onClick: download,
      className: "btn btn-dark",
      spin: busy === "download",
    },
    {
      key: "share",
      label: "Share PDF",
      icon: busy === "share" ? Loader2 : Share2,
      onClick: share,
      className: "btn btn-ghost",
      spin: busy === "share",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map((button) => (
          <button
            key={button.key}
            type="button"
            onClick={button.onClick}
            className={button.className}
            aria-label={button.label}
            title={button.label}
          >
            <button.icon className={`h-4 w-4 ${button.spin ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{button.label}</span>
          </button>
        ))}
        {message && (
          <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
            <Check className="h-3 w-3" /> {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {buttons.map((button) => (
          <button key={button.key} type="button" onClick={button.onClick} className={`${button.className} py-3`}>
            <button.icon className={`h-4 w-4 ${button.spin ? "animate-spin" : ""}`} />
            {button.label}
          </button>
        ))}
      </div>
      {message && (
        <p className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800">
          <Check className="h-4 w-4" /> {message}
        </p>
      )}
    </div>
  );
}

export function DeleteEstimateButton({ id, estimateNo }: { id: number; estimateNo: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Could not delete this estimate");
        return;
      }
      setOpen(false);
      router.push("/dashboard/estimates");
      router.refresh();
    } catch {
      setError("Network error while deleting");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        aria-label={`Delete estimate ${estimateNo}`}
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            aria-label="Cancel delete"
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => !busy && setOpen(false)}
          />
          <div role="dialog" aria-modal="true" className="card relative w-full max-w-md p-6">
            <h3 className="text-lg font-bold">Delete estimate {estimateNo}?</h3>
            <p className="mt-2 text-sm text-ink-500">
              This permanently removes the estimate and its window measurements. The customer record is kept.
            </p>
            {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={confirm} className="btn bg-rose-600 text-white hover:bg-rose-700" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Yes, delete it
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost" disabled={busy}>
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function StatusSelect({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  const change = async (next: string) => {
    setBusy(true);
    setValue(next);
    try {
      const response = await fetch(`/api/estimates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) setValue(status);
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Status</span>
      <select
        className="field py-2 text-sm"
        value={value}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        aria-label="Estimate status"
      >
        {(Object.keys(ESTIMATE_STATUS) as EstimateStatus[]).map((key) => (
          <option key={key} value={key}>
            {ESTIMATE_STATUS[key].label}
          </option>
        ))}
      </select>
    </label>
  );
}
