const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹5,380 — Indian grouping, no decimals when the value is whole. */
export function formatINR(value: number, opts?: { decimals?: boolean }): string {
  if (!Number.isFinite(value)) return "₹0";
  const useDecimals = opts?.decimals ?? !Number.isInteger(Math.round(value * 100) / 100);
  return `₹${(useDecimals ? inrFormatter : inrWhole).format(value)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);
}

export function formatArea(value: number): string {
  return `${formatNumber(value, 1)} Sq. Ft.`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()} • ${time}`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatInputDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function relativeDay(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const today = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
  return formatDate(date);
}

export function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
