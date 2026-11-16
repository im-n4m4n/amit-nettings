"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Plus,
  Settings,
  Images,
  Sliders,
  Users,
  X,
} from "@/components/icons";
import { BrandMark } from "@/components/site/brand";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/estimates", label: "Estimates", icon: Home },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Mail },
  { href: "/dashboard/gallery", label: "Media gallery", icon: Images },
  { href: "/dashboard/services", label: "Services & rates", icon: Sliders },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const navList = (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            isActive(item.href)
              ? "bg-brand-600 text-white"
              : "text-ink-700 hover:bg-white hover:text-ink-950"
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </span>
          {isActive(item.href) && <ChevronRight className="h-4 w-4" />}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-[268px] shrink-0 border-r border-ink-900/8 bg-white px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen">
          <Link href="/dashboard" className="flex items-center gap-3 px-1">
            <BrandMark className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-display text-[0.98rem] font-extrabold">Amit Nettings</span>
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-600">
                Workspace
              </span>
            </span>
          </Link>

          <div className="mt-6">{navList}</div>

          <Link href="/dashboard/estimates/new" className="btn btn-primary mt-6 w-full">
            <Plus className="h-4 w-4" /> New estimate
          </Link>

          <div className="mt-8 rounded-2xl border border-ink-900/8 bg-white p-4">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
            <button type="button" onClick={signOut} className="btn btn-ghost mt-3 w-full text-xs" disabled={signingOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
            <Link href="/" className="mt-2 block text-center text-xs font-semibold text-ink-400 hover:text-brand-700">
              View public website
            </Link>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex-1">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-ink-900/8 bg-white px-4 py-3 lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrandMark className="h-9 w-9" />
              <span className="font-display text-sm font-extrabold">Amit Nettings</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/estimates/new" className="btn btn-primary px-3 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> New
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-ink-900/10 bg-white"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[86%] max-w-sm bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold">Navigation</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink-900/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">{navList}</div>
            <Link href="/dashboard/estimates/new" className="btn btn-primary mt-5 w-full">
              <Plus className="h-4 w-4" /> New estimate
            </Link>
            <button type="button" onClick={signOut} className="btn btn-ghost mt-3 w-full" disabled={signingOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
