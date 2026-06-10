import {
  BookOpen,
  Calendar,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "../../../components/auth-buttons";
import { requireAdmin } from "../../../lib/access";
import Bookmark from "../../../models/Bookmark";
import User from "../../../models/User";

export const metadata: Metadata = {
  title: "Customer Management",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatDate(value?: Date | string) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const q = param(params.q).trim();
  const query = q
    ? {
        $or: [
          { name: new RegExp(escapeRegex(q), "i") },
          { email: new RegExp(escapeRegex(q), "i") },
        ],
      }
    : {};

  const [users, totalUsers, credentialUsers, googleUsers, totalBookmarks, bookmarkCounts] =
    await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .select("name email birthDate website authProvider role createdAt")
        .lean(),
      User.countDocuments(),
      User.countDocuments({ authProvider: "credentials" }),
      User.countDocuments({ authProvider: "google" }),
      Bookmark.countDocuments(),
      Bookmark.aggregate<{ _id: unknown; count: number }>([
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
    ]);

  const countsByUser = new Map(
    bookmarkCounts.map((item) => [String(item._id), Number(item.count)])
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="MyBookmark" width={260} height={70} className="h-auto w-[180px]" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              My dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
              <ShieldCheck size={18} />
              Protected admin area
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Customers</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review registered accounts and their bookmark activity.
            </p>
          </div>
          <form className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or email"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </form>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UsersRound className="text-indigo-600" size={21} />
            <p className="mt-4 text-3xl font-bold">{totalUsers}</p>
            <p className="text-sm text-slate-500">Total customers</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Mail className="text-emerald-600" size={21} />
            <p className="mt-4 text-3xl font-bold">{credentialUsers}</p>
            <p className="text-sm text-slate-500">Email accounts</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserRound className="text-violet-600" size={21} />
            <p className="mt-4 text-3xl font-bold">{googleUsers}</p>
            <p className="text-sm text-slate-500">Google accounts</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-amber-600" size={21} />
            <p className="mt-4 text-3xl font-bold">{totalBookmarks}</p>
            <p className="text-sm text-slate-500">Published bookmarks</p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date of birth</th>
                  <th className="px-5 py-4">Account</th>
                  <th className="px-5 py-4">Bookmarks</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user._id.toString()} className="text-sm">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{user.name ?? "Unnamed user"}</p>
                      <p className="mt-0.5 text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={15} />
                        {formatDate(user.birthDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">
                        {user.authProvider ?? "google"}
                      </span>
                      {user.role === "admin" && (
                        <span className="ml-2 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {countsByUser.get(user._id.toString()) ?? 0}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="max-w-56 truncate px-5 py-4 text-slate-600">
                      {user.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {user.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No customers match your search.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
