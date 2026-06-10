import { ExternalLink, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import connectDB from "../../lib/mongodb";
import Bookmark from "../../models/Bookmark";

export const metadata: Metadata = {
  title: "Top Bookmarks",
  description: "Browse highly rated useful links shared by the MyBookmark community.",
  alternates: { canonical: "/top-bookmarks" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function TopBookmarksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(param(params.page), 10) || 1);
  const pageSize = 10;

  await connectDB();
  const [bookmarks, totalBookmarks] = await Promise.all([
    Bookmark.find({})
      .populate("user", "name email")
      .sort({ score: -1, savedCount: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Bookmark.countDocuments(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalBookmarks / pageSize));

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-5 flex items-center gap-2">
          <Trophy className="text-amber-600" size={24} />
          <h1 className="text-3xl font-bold tracking-tight">Top Bookmarks</h1>
        </div>

        <section className="grid gap-4">
          {bookmarks.map((bookmark, index) => {
            const user = bookmark.user as unknown as {
              _id: { toString(): string };
              name?: string;
              email: string;
            };

            return (
              <article
                key={bookmark._id.toString()}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 font-bold text-amber-700">
                    {(page - 1) * pageSize + index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-2 text-lg font-bold text-slate-950 hover:text-indigo-600"
                    >
                      <span>{bookmark.title}</span>
                      <ExternalLink size={15} className="mt-1" />
                    </a>
                    <p className="mt-1 truncate text-xs text-slate-400">{bookmark.url}</p>
                    {bookmark.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {bookmark.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <Link href={`/users/${user._id.toString()}`} className="font-medium hover:text-indigo-600">
                        by {user.name ?? user.email}
                      </Link>
                      <span>{bookmark.score} score</span>
                      <span>{bookmark.savedCount ?? 0} saved</span>
                      <span>{formatDate(bookmark.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
            <Link
              href={`/top-bookmarks?page=${Math.max(1, page - 1)}`}
              aria-disabled={page <= 1}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                page <= 1
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              Previous
            </Link>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Link
              href={`/top-bookmarks?page=${Math.min(totalPages, page + 1)}`}
              aria-disabled={page >= totalPages}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                page >= totalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              Next
            </Link>
          </nav>
        )}
      </div>
    </main>
  );
}
