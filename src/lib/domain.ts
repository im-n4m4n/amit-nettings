/**
 * Core business math for Amit Nettings estimates.
 * Measurements are entered in inches or feet and always normalised to feet.
 */

export type BillingUnit = "sqft" | "rft" | "pcs";
export type MeasurementUnit = "in" | "ft";
export type EstimateStatus = "draft" | "sent" | "confirmed" | "completed" | "cancelled";

export const BILLING_UNITS: Record<BillingUnit, { label: string; short: string; hint: string }> = {
  sqft: { label: "Sq. Ft.", short: "SQFT", hint: "Width × Height (area)" },
  rft: { label: "R. Ft.", short: "RFT", hint: "Running feet — 2 × (Width + Height)" },
  pcs: { label: "Pcs", short: "PCS", hint: "Fixed price per window / piece" },
};

export const UNIT_SHORT: Record<BillingUnit, string> = {
  sqft: "SQFT",
  rft: "RFT",
  pcs: "PCS",
};

export const UNIT_SUFFIX: Record<BillingUnit, string> = {
  sqft: "Sq. Ft.",
  rft: "R. Ft.",
  pcs: "Pcs",
};

export const ESTIMATE_STATUS: Record<EstimateStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
  sent: { label: "Sent", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  confirmed: { label: "Confirmed", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  completed: { label: "Completed", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const INCHES_PER_FOOT = 12;

export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function inchesToFeet(inches: number): number {
  return round2(inches / INCHES_PER_FOOT);
}

/** Normalises an entered measurement (inches or feet) into feet at full precision. */
export function toFeet(value: number, unit: MeasurementUnit): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return unit === "in" ? value / INCHES_PER_FOOT : value;
}

/** Billing quantity for a line item based on the selected unit. */
export function lineQuantity(unit: BillingUnit, widthFt: number, heightFt: number): number {
  const w = widthFt > 0 ? widthFt : 0;
  const h = heightFt > 0 ? heightFt : 0;
  if (unit === "pcs") return 1;
  if (unit === "rft") return round2(2 * (w + h));
  return round2(w * h);
}

export function linePrice(quantity: number, rate: number): number {
  return round2(quantity * rate);
}

export type LineInput = {
  unit: BillingUnit;
  rate: number;
  widthValue: number;
  heightValue: number;
  measurementUnit: MeasurementUnit;
};

export type LineResult = {
  widthFt: number;
  heightFt: number;
  quantity: number;
  price: number;
};

export function computeLine(input: LineInput): LineResult {
  const widthFt = toFeet(input.widthValue, input.measurementUnit);
  const heightFt = toFeet(input.heightValue, input.measurementUnit);
  const quantity = lineQuantity(input.unit, widthFt, heightFt);
  return { widthFt, heightFt, quantity, price: linePrice(quantity, input.rate) };
}

export type Totals = { quantity: number; area: number; subtotal: number };

export function computeTotals(lines: { quantity: number; price: number; widthFt: number; heightFt: number; unit: BillingUnit }[]): Totals {
  let quantity = 0;
  let area = 0;
  let subtotal = 0;
  for (const line of lines) {
    quantity += line.quantity;
    if (line.unit === "sqft") area += line.quantity;
    else if (line.unit === "rft") area += line.quantity;
    subtotal += line.price;
  }
  return {
    quantity: round2(quantity),
    area: round2(area),
    subtotal: round2(subtotal),
  };
}

export function finalPrice(subtotal: number, discount: number): number {
  return round2(Math.max(0, subtotal - (Number.isFinite(discount) ? discount : 0)));
}

/** "21.33 ft" style conversion caption. */
export function feetCaption(value: number): string {
  return `${value.toFixed(2)} ft`;
}

/** 256 in → "256 in (21.33 ft)" */
export function measurementLabel(value: number, unit: MeasurementUnit): string {
  if (unit === "ft") return `${value.toFixed(2)} ft`;
  return `${round2(value)} in (${feetCaption(inchesToFeet(value))})`;
}

export function normalisePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  // Strip a leading country code for storage of Indian numbers.
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function formatPhone(raw: string): string {
  const digits = normalisePhone(raw);
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length > 10) return `+${digits}`;
  return raw;
}

export function whatsappLink(phone: string, message: string): string {
  const digits = normalisePhone(phone);
  const target = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function isBillingUnit(value: unknown): value is BillingUnit {
  return value === "sqft" || value === "rft" || value === "pcs";
}

export function isMeasurementUnit(value: unknown): value is MeasurementUnit {
  return value === "in" || value === "ft";
}

export function isEstimateStatus(value: unknown): value is EstimateStatus {
  return value === "draft" || value === "sent" || value === "confirmed" || value === "completed" || value === "cancelled";
}
