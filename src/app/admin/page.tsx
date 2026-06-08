import { BookOpen, Inbox, Link2, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "../../components/auth-buttons";
import { requireAdmin } from "../../lib/access";
import Bookmark from "../../models/Bookmark";
import ContactQuery from "../../models/ContactQuery";
import User from "../../models/User";

function formatDate(value?: Date | string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [totalUsers, totalBookmarks, totalQueries, latestQueries, latestBookmarks] =
    await Promise.all([
      User.countDocuments(),
      Bookmark.countDocuments(),
      ContactQuery.countDocuments(),
      ContactQuery.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      Bookmark.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(8)
        .select("title url score user createdAt")
        .lean(),
    ]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white">
              <Link2 size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">LinkHive Admin</span>
              <span className="block text-xs text-slate-500">Secure dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Customers
            </Link>
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
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <ShieldCheck size={18} />
          Protected admin area
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin Dashboard</h1>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UsersRound className="text-indigo-600" size={22} />
            <p className="mt-4 text-3xl font-bold">{totalUsers}</p>
            <p className="text-sm text-slate-500">Customers</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-emerald-600" size={22} />
            <p className="mt-4 text-3xl font-bold">{totalBookmarks}</p>
            <p className="text-sm text-slate-500">Bookmarks</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Inbox className="text-amber-600" size={22} />
            <p className="mt-4 text-3xl font-bold">{totalQueries}</p>
            <p className="text-sm text-slate-500">Contact queries</p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Latest contact queries</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {latestQueries.map((query) => (
                <article key={query._id.toString()} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{query.subject}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {query.name} · {query.email}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(query.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{query.message}</p>
                </article>
              ))}
              {latestQueries.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No queries yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Latest bookmarks</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {latestBookmarks.map((bookmark) => {
                const user = bookmark.user as unknown as { name?: string; email: string };

                return (
                  <article key={bookmark._id.toString()} className="py-3">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-slate-950 hover:text-indigo-600"
                    >
                      {bookmark.title}
                    </a>
                    <p className="mt-1 text-sm text-slate-500">
                      by {user.name ?? user.email} · {bookmark.score} score · {formatDate(bookmark.createdAt)}
                    </p>
                  </article>
                );
              })}
              {latestBookmarks.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No bookmarks yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
