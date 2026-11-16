import Image from "next/image";
import Link from "next/link";

export function BrandMark({ className = "h-10 w-10", rounded = "rounded-xl" }: { className?: string; rounded?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-white shadow-soft ring-1 ring-ink-900/10 ${rounded} ${className}`}
      aria-hidden="true"
    >
      <Image src="/media/logo-mark.png" alt="" fill sizes="64px" className="object-contain p-1.5" />
    </span>
  );
}

export function BrandLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="Amit Nettings home">
      <BrandMark className="h-11 w-11" />
      <span className="leading-tight">
        <span className="block font-display text-[1.1rem] font-extrabold tracking-tight text-ink-950">Amit Nettings</span>
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-600">
          Netting Services
        </span>
      </span>
    </Link>
  );
}
