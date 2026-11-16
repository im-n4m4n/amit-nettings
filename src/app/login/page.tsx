import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "@/components/icons";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/site/brand";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: "Sign in to the Amit Nettings estimate dashboard.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-brand-50">
      <div className="shell relative flex min-h-screen flex-col items-center justify-center py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3">
            <BrandMark className="h-12 w-12" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold">Amit Nettings</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                Estimate dashboard
              </span>
            </span>
          </div>
          <Suspense fallback={<div className="card h-72 animate-pulse" />}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Sessions are signed, HTTP-only and expire after 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}
