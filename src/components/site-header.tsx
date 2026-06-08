import { Link2 } from "lucide-react";
import Link from "next/link";
import { auth } from "../lib/auth";
import { DashboardButton, SignInButton, SignOutButton } from "./auth-buttons";

export async function SiteHeader({ subtitle = "Useful corners of the internet" }: { subtitle?: string }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
              <Link2 size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">LinkHive</span>
              <span className="block text-xs text-slate-500">{subtitle}</span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Home
          </Link>
          <Link
            href="/top-bookmarks"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Top Bookmarks
          </Link>
          <Link
            href="/contact"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Contact
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Admin
            </Link>
          )}
          {session?.user ? (
            <>
              <DashboardButton />
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </nav>
      </div>
    </header>
  );
}
