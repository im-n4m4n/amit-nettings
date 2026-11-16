import Link from "next/link";
import type { ReactNode } from "react";
import { ESTIMATE_STATUS, type EstimateStatus } from "@/lib/domain";
import { relativeDay } from "@/lib/format";

export function StatCard({
  label,
  value,
  hint,
  tone = "light",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "light" | "dark" | "brand";
}) {
  const styles =
    tone === "dark"
      ? "bg-ink-950 text-white border-transparent"
      : tone === "brand"
        ? "bg-brand-50 border-brand-200"
        : "bg-white border-ink-900/8";

  return (
    <div className={`rounded-2xl border p-5 shadow-soft ${styles}`}>
      <p
        className={`text-[0.68rem] font-bold uppercase tracking-[0.14em] ${
          tone === "dark" ? "text-white/55" : "text-ink-400"
        }`}
      >
        {label}
      </p>
      <p className={`mt-2 font-display text-2xl font-extrabold ${tone === "dark" ? "text-white" : "text-ink-950"}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-xs ${tone === "dark" ? "text-white/55" : "text-ink-400"}`}>{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config = ESTIMATE_STATUS[(status as EstimateStatus) in ESTIMATE_STATUS ? (status as EstimateStatus) : "draft"];
  return <span className={`chip ring-1 ${config.tone}`}>{config.label}</span>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-ink-500">{body}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary mt-5">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function RelativeDate({ value }: { value: string }) {
  return <span>{relativeDay(value)}</span>;
}
