"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Save, ShieldCheck } from "@/components/icons";

type Settings = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  hours: string;
  gstin: string;
  mapEmbed: string;
  quoteTerms: string;
};

const FIELDS: { key: keyof Settings; label: string; placeholder: string; wide?: boolean }[] = [
  { key: "businessName", label: "Business name", placeholder: "Amit Nettings" },
  { key: "tagline", label: "Tagline", placeholder: "Professional Nettings services" },
  { key: "phone", label: "Phone", placeholder: "+91 70219 46002" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "917021946002" },
  { key: "email", label: "Email", placeholder: "amitnettings@gmail.com" },
  { key: "gstin", label: "GSTIN (optional)", placeholder: "09ABCDE1234F1Z5" },
  { key: "address", label: "Address", placeholder: "Shop No. 3783, KKR Rd, Turbhe" },
  { key: "city", label: "City / region", placeholder: "Navi Mumbai, Maharashtra 400705" },
  { key: "hours", label: "Working hours (optional)", placeholder: "Mon – Sat, 9:00 AM – 8:00 PM" },
  { key: "mapEmbed", label: "Google Maps embed link", placeholder: "https://www.google.com/maps/embed?pb=…" },
];

export function BusinessSettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [values, setValues] = useState<Settings>(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Could not save the business profile");
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Network error while saving");
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <h2 className="font-bold">Business profile</h2>
      <p className="mt-1 text-sm text-ink-500">
        These details appear on every PDF quotation, on the website footer and in WhatsApp messages.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className={field.key === "address" || field.key === "mapEmbed" ? "sm:col-span-2" : undefined}>
            <label className="label" htmlFor={`settings-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`settings-${field.key}`}
              className="field"
              value={values[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, [field.key]: event.target.value }));
                setStatus("idle");
              }}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="settings-quoteTerms">
            Quotation terms (printed on the PDF)
          </label>
          <textarea
            id="settings-quoteTerms"
            className="field min-h-[120px] resize-y"
            value={values.quoteTerms}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, quoteTerms: event.target.value }));
              setStatus("idle");
            }}
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
          <Check className="h-4 w-4" /> Business profile updated.
        </p>
      )}

      <button type="submit" className="btn btn-primary mt-5" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Could not change the password");
        return;
      }
      setMessage("Password updated. Use the new password next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error while updating password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-bold">
        <ShieldCheck className="h-4.5 w-4.5 text-brand-700" /> Change password
      </h2>
      <p className="mt-1 text-sm text-ink-500">Passwords are stored as salted scrypt hashes — never in plain text.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="current-password">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            className="field"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="new-password">
            New password (min 6 characters)
          </label>
          <input
            id="new-password"
            type="password"
            className="field"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            className="field"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{message}</p>}

      <button type="submit" className="btn btn-dark mt-5" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Update password
      </button>
    </form>
  );
}
