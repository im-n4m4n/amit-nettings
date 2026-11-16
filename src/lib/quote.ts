import { type BillingUnit, type MeasurementUnit } from "@/lib/domain";
import { formatINR, formatNumber } from "@/lib/format";

export type BusinessProfile = {
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

export type QuoteItem = {
  label: string;
  widthValue: number;
  heightValue: number;
  widthFt: number;
  heightFt: number;
  quantity: number;
  rate: number;
  price: number;
};

export type QuoteData = {
  business: BusinessProfile;
  estimateNo?: string | null;
  createdAt?: string | null;
  customer: { name: string; phone: string; address?: string; city?: string };
  serviceName: string;
  unit: BillingUnit;
  measurementUnit: MeasurementUnit;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
};

const UNIT_TEXT: Record<BillingUnit, string> = {
  sqft: "Sq. Ft.",
  rft: "Running Ft.",
  pcs: "Pieces",
};

const UNIT_WORD: Record<BillingUnit, string> = {
  sqft: "sq.ft",
  rft: "r.ft",
  pcs: "pcs",
};

export function sizeLabel(
  item: { widthValue: number; heightValue: number; widthFt: number; heightFt: number },
  measurementUnit: MeasurementUnit,
): string {
  if (measurementUnit === "in") {
    return `${formatNumber(item.widthValue, 0)} in × ${formatNumber(item.heightValue, 0)} in (${item.widthFt.toFixed(2)} × ${item.heightFt.toFixed(2)} ft)`;
  }
  return `${item.widthFt.toFixed(2)} ft × ${item.heightFt.toFixed(2)} ft`;
}

export function quantityLabel(data: Pick<QuoteData, "unit">): string {
  return UNIT_TEXT[data.unit];
}

/**
 * Short estimate message for WhatsApp / copy / native share.
 * Only the points a customer needs: who, what, each size, the total.
 * The full breakdown lives in the PDF.
 */
export function buildQuoteText(data: QuoteData): string {
  const unit = UNIT_WORD[data.unit];
  const lines: string[] = [
    `*${data.business.businessName}* · Estimate${data.estimateNo ? ` ${data.estimateNo}` : ""}`,
    `${data.customer.name} · ${data.serviceName}`,
  ];

  data.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${formatNumber(item.widthValue)}×${formatNumber(item.heightValue)} ${data.measurementUnit} · ${formatNumber(item.quantity)} ${unit} · ${formatINR(item.price)}`,
    );
  });

  if (data.discount > 0) lines.push(`Discount: -${formatINR(data.discount)}`);

  const quantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  lines.push(`*Total: ${formatNumber(quantity)} ${unit} · ${formatINR(data.total)}*`);
  if (data.business.phone) lines.push(`Call ${data.business.phone}`);

  return lines.join("\n");
}

/** Short new-enquiry message sent to the business WhatsApp. Empty fields are skipped. */
export function buildEnquiryText(input: { name: string; phone: string; service?: string; message?: string }): string {
  const note = (input.message ?? "").replace(/\s+/g, " ").trim();
  const lines = ["*New enquiry*", `Name: ${input.name.trim()}`, `Phone: ${input.phone.trim()}`];
  if (input.service) lines.push(`Service: ${input.service}`);
  if (note) lines.push(`Note: ${note.length > 160 ? `${note.slice(0, 157)}…` : note}`);
  return lines.join("\n");
}
