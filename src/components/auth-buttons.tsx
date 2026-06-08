"use client";

import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <Link
      href="/auth"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
    >
      <LogIn size={17} />
      Sign in
    </Link>
  );
}

export function DashboardButton() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      <LayoutDashboard size={16} />
      Dashboard
    </Link>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}
