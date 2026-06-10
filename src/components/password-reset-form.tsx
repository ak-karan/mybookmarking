"use client";

import { KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";

export function PasswordResetForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      if (!token) {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.get("email") }),
        });
        const payload = (await response.json()) as { error?: string; message?: string };
        setMessage(payload.error ?? payload.message ?? "Password reset requested.");
        setIsSuccess(response.ok);
        return;
      }

      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      if (password !== confirmPassword) {
        setMessage("Password and confirmation do not match.");
        return;
      }

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      setMessage(payload.error ?? payload.message ?? "Password updated.");
      setIsSuccess(response.ok);

      if (response.ok) {
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      {!token ? (
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email</span>
          <span className="relative block">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </span>
        </label>
      ) : (
        <>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">New password</span>
            <span className="relative block">
              <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-indigo-400"
              />
            </span>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>
        </>
      )}

      {message && (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {isPending && <Loader2 className="animate-spin" size={17} />}
        {isPending ? "Please wait..." : token ? "Set new password" : "Send reset link"}
      </button>

      <Link href="/auth" className="text-center text-sm font-semibold text-slate-500 hover:text-slate-950">
        Back to sign in
      </Link>
    </form>
  );
}
