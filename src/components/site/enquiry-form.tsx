"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "@/components/icons";
import { whatsappLink } from "@/lib/domain";
import { buildEnquiryText } from "@/lib/quote";

type Props = {
  services: { slug: string; name: string }[];
  whatsapp: string;
  defaultService?: string;
  title?: string;
  subtitle?: string;
};

type Errors = Record<string, string>;

const EMPTY = { name: "", phone: "", serviceSlug: "", message: "" };

/**
 * One submit does two things:
 *  1. saves the enquiry to the admin panel (POST /api/enquiries)
 *  2. opens WhatsApp to the business number with a short, pre-filled summary
 */
export function EnquiryForm({
  services,
  whatsapp,
  defaultService = "",
  title = "Get a quote",
  subtitle = "Fill out this form to get in touch.",
}: Props) {
  const [values, setValues] = useState({ ...EMPTY, serviceSlug: defaultService });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const [waLink, setWaLink] = useState("");

  const set = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    const digits = values.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) next.phone = "Enter a valid 10-digit mobile number";
    if (!values.serviceSlug) next.serviceSlug = "Select a service";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("saving");
    // Opened inside the click so browsers don't block it; pointed at WhatsApp once the enquiry is saved.
    const tab = window.open("", "_blank");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; fieldErrors?: Errors };
      if (!response.ok || !payload.ok) {
        tab?.close();
        if (payload.fieldErrors) setErrors(payload.fieldErrors);
        setServerError(payload.error || "Could not send your enquiry. Please try again.");
        setStatus("idle");
        return;
      }
    } catch {
      tab?.close();
      setServerError("Network error. Please check your connection and try again.");
      setStatus("idle");
      return;
    }

    const serviceName =
      services.find((service) => service.slug === values.serviceSlug)?.name ??
      (values.serviceSlug === "other" ? "Other Service" : undefined);
    const link = whatsappLink(
      whatsapp,
      buildEnquiryText({ name: values.name, phone: values.phone, service: serviceName, message: values.message }),
    );
    setWaLink(link);
    if (tab) {
      tab.opener = null;
      tab.location.href = link;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="card flex h-full flex-col items-center justify-center p-8 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-bold">Enquiry received</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
          Your details are saved with our team. Send the WhatsApp message that just opened for a faster reply.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Open WhatsApp
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setValues({ ...EMPTY, serviceSlug: defaultService });
              setStatus("idle");
            }}
          >
            New enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card h-full p-6 sm:p-8" noValidate>
      <div className="text-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="enq-name">
            Name
          </label>
          <input
            id="enq-name"
            className={`field ${errors.name ? "field-error" : ""}`}
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            autoComplete="name"
          />
          {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="enq-phone">
            Phone
          </label>
          <input
            id="enq-phone"
            className={`field ${errors.phone ? "field-error" : ""}`}
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="enq-service">
            Service
          </label>
          <select
            id="enq-service"
            className={`field ${errors.serviceSlug ? "field-error" : ""}`}
            value={values.serviceSlug}
            onChange={(event) => set("serviceSlug", event.target.value)}
          >
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
            <option value="other">Other Service</option>
          </select>
          {errors.serviceSlug && <p className="mt-1 text-xs font-semibold text-red-600">{errors.serviceSlug}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="enq-message">
            Message <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <textarea
            id="enq-message"
            className="field min-h-[84px] resize-y"
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
            maxLength={600}
          />
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn btn-primary mt-6 w-full py-3" disabled={status === "saving"}>
        {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === "saving" ? "Sending…" : "Request quote"}
      </button>
      <p className="mt-3 text-center text-xs text-ink-400">Saved with our team and opened in WhatsApp.</p>
    </form>
  );
}
