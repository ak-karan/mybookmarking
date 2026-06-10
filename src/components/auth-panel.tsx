"use client";

import { Calendar, KeyRound, LogIn, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type Mode = "login" | "signup";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      if (mode === "signup") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            email,
            password,
            birthDate: formData.get("birthDate"),
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          message?: string;
          requiresVerification?: boolean;
        };

        if (!response.ok) {
          setMessage(payload.error ?? "Could not create account.");
          return;
        }

        setVerificationEmail(payload.requiresVerification ? email : "");
        setMessage(payload.message ?? "Account created. You can sign in now.");
        if (!payload.requiresVerification) {
          setMode("login");
        }
        form.reset();
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setMessage("Email/password is incorrect, or your email is not verified yet.");
        setVerificationEmail(email);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function resendVerification() {
    if (!verificationEmail) {
      return;
    }

    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      setMessage(payload.error ?? payload.message ?? "Verification email requested.");
    });
  }

  return (
    <section className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white sm:p-10">
          <div className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-300">
            MyBookmark Accounts
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Build your bookmark profile.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Save links, manage your profile, update your password, and keep a clean dashboard for your shared resources.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <span className="rounded-lg bg-white/5 px-3 py-2">Custom email signup with DOB</span>
            <span className="rounded-lg bg-white/5 px-3 py-2">Google sign-in support</span>
            <span className="rounded-lg bg-white/5 px-3 py-2">Secure password hashing</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`h-10 rounded-lg text-sm font-semibold ${
                mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={`h-10 rounded-lg text-sm font-semibold ${
                mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogIn size={17} />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or use email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Full name</span>
                <span className="relative block">
                  <UserRound className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    placeholder="Akash Karan"
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  placeholder="you@example.com"
                />
              </span>
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Date of birth</span>
                <span className="relative block">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    name="birthDate"
                    type="date"
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                Password
                {mode === "login" && (
                  <Link href="/reset-password" className="text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                )}
              </span>
              <span className="relative block">
                <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  placeholder="Minimum 8 characters"
                />
              </span>
            </label>

            {message && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                <p>{message}</p>
                {verificationEmail && (
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="mt-2 font-semibold text-indigo-700 underline underline-offset-2"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            <button
              disabled={isPending}
              className="h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
