"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, LogIn } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    const local: Record<string, string> = {};
    if (email.trim().length < 3) local.email = "Enter your email";
    if (password.length < 6) local.password = "Password must be at least 6 characters";
    setErrors(local);
    if (Object.keys(local).length) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!response.ok || !payload.ok) {
        if (payload.fieldErrors) setErrors(payload.fieldErrors);
        setFormError(payload.error || "Login failed. Please try again.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-7" noValidate>
      <h1 className="text-2xl font-extrabold">Staff sign in</h1>
      <p className="mt-2 text-sm text-ink-500">
        Access the estimate dashboard, customer records and PDF quotations.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className={`field ${errors.email ? "field-error" : ""}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className={`field ${errors.password ? "field-error" : ""}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password}</p>}
        </div>
      </div>

      {formError && (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {formError}
        </p>
      )}

      <button type="submit" className="btn btn-primary mt-6 w-full py-3" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Sign in
      </button>

    </form>
  );
}
