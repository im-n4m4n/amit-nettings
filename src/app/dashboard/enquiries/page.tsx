import Link from "next/link";
import { Calculator, Mail, MapPin, MessageCircle, Phone } from "@/components/icons";
import { PageHeader } from "@/components/dashboard/ui";
import { EnquiryStatusSelect } from "@/components/dashboard/enquiry-status";
import { listEnquiries, getActiveServices } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { formatPhone, whatsappLink } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const [enquiries] = await Promise.all([listEnquiries(), getActiveServices()]);
  const newCount = enquiries.filter((enquiry) => enquiry.status === "new").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website enquiries"
        subtitle={
          enquiries.length === 0
            ? "Enquiries submitted from the public website will appear here."
            : `${enquiries.length} enquiry${enquiries.length === 1 ? "" : "s"} · ${newCount} awaiting first response`
        }
      />

      {enquiries.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Mail className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-bold">Inbox is empty</h3>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            Every quote request from the public website lands here, and is also sent to your WhatsApp.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-extrabold">{enquiry.name}</span>
                    {enquiry.serviceName && <span className="chip bg-brand-50 text-brand-700">{enquiry.serviceName}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
                    <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                      <Phone className="h-3.5 w-3.5 text-brand-600" /> {formatPhone(enquiry.phone)}
                    </a>
                    {enquiry.email && (
                      <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                        <Mail className="h-3.5 w-3.5 text-brand-600" /> {enquiry.email}
                      </a>
                    )}
                    {enquiry.address && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-600" /> {enquiry.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400">{formatDateTime(enquiry.createdAt)}</p>
                  <div className="mt-2">
                    <EnquiryStatusSelect id={enquiry.id} status={enquiry.status} />
                  </div>
                </div>
              </div>

              {enquiry.message && (
                <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-ink-900/8 bg-sand-50 p-4 font-sans text-xs leading-relaxed text-ink-700">
                  {enquiry.message}
                </pre>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-900/8 pt-4">
                <a
                  href={whatsappLink(
                    enquiry.phone,
                    `Hello ${enquiry.name}, thank you for contacting Amit Nettings regarding ${enquiry.serviceName ?? "our services"}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
                </a>
                <a href={`tel:${enquiry.phone}`} className="btn btn-ghost">
                  <Phone className="h-4 w-4" /> Call back
                </a>
                <Link
                  href={`/dashboard/estimates/new?name=${encodeURIComponent(enquiry.name)}&phone=${encodeURIComponent(enquiry.phone)}${enquiry.serviceSlug && enquiry.serviceSlug !== "other" ? `&service=${encodeURIComponent(enquiry.serviceSlug)}` : ""}`}
                  className="btn btn-primary"
                >
                  <Calculator className="h-4 w-4" /> Create estimate
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
