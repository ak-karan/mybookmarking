import { BookmarkPlus, ExternalLink, MessageCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { UrlBookmarkForm } from "../components/url-bookmark-form";
import { auth } from "../lib/auth";
import connectDB from "../lib/mongodb";
import Bookmark from "../models/Bookmark";
import User from "../models/User";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type FeedUser = {
  _id: string;
  name?: string;
  email: string;
};

type FeedBookmark = {
  _id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  categories: string[];
  score: number;
  savedCount: number;
  commentCount: number;
  createdAt: Date;
  user: FeedUser;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function databaseSetupView(message: string) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 shadow-xl shadow-amber-100">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
          MongoDB setup required
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
          Database connection abhi valid nahi hai
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Current runtime message: <span className="font-mono text-slate-900">{message}</span>
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-sm text-slate-100">
          MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.xxxxx.mongodb.net/mybookDB?retryWrites=true&amp;w=majority
        </div>
      </section>
    </main>
  );
}

function normalizeBookmarks(items: unknown[]) {
  return items.map((item) => {
    const bookmark = item as FeedBookmark & {
      _id: { toString(): string };
      user: FeedUser & { _id: { toString(): string } };
    };

    return {
      ...bookmark,
      _id: bookmark._id.toString(),
      user: {
        ...bookmark.user,
        _id: bookmark.user._id.toString(),
      },
    };
  }) as FeedBookmark[];
}

function BookmarkList({ bookmarks }: { bookmarks: FeedBookmark[] }) {
  if (bookmarks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No bookmarks found.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <article
          key={bookmark._id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-start gap-2 text-lg font-bold tracking-tight text-slate-950 hover:text-indigo-600"
              >
                <span>{bookmark.title}</span>
                <ExternalLink size={15} className="mt-1 shrink-0 opacity-0 group-hover:opacity-100" />
              </a>
              <p className="mt-1 truncate text-xs text-slate-400">{bookmark.url}</p>
            </div>
            <span className="rounded-lg bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
              {bookmark.score}
            </span>
          </div>

          {bookmark.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{bookmark.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {bookmark.categories.map((item) => (
              <span key={item} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                {item}
              </span>
            ))}
            {bookmark.tags.map((item) => (
              <span key={item} className="text-xs font-medium text-violet-600">
                #{item}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <Link href={`/users/${bookmark.user._id}`} className="font-medium hover:text-indigo-600">
              by {bookmark.user.name ?? bookmark.user.email}
            </Link>
            <span>{formatDate(bookmark.createdAt)}</span>
            <span>{bookmark.savedCount ?? 0} saved</span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={14} />
              {bookmark.commentCount} comments
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(param(params.page), 10) || 1);
  const pageSize = 10;
  let session: Awaited<ReturnType<typeof auth>> = null;
  let currentUser = null;
  let topBookmarks: FeedBookmark[] = [];
  let recentBookmarks: FeedBookmark[] = [];
  let totalPages = 1;

  try {
    session = await auth();
    await connectDB();
    currentUser = session?.user?.email
      ? await User.findOne({ email: session.user.email.toLowerCase() }).select("_id").lean()
      : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect to MongoDB.";
    return databaseSetupView(message);
  }

  try {
    const [topRaw, recentRaw, totalRecent] = await Promise.all([
      Bookmark.find({})
        .populate("user", "name email")
        .sort({ score: -1, savedCount: -1, createdAt: -1 })
        .limit(10)
        .lean(),
      Bookmark.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Bookmark.countDocuments(),
    ]);

    totalPages = Math.max(1, Math.ceil(totalRecent / pageSize));
    topBookmarks = normalizeBookmarks(topRaw);
    recentBookmarks = normalizeBookmarks(recentRaw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read from MongoDB.";
    return databaseSetupView(message);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="text-amber-600" size={22} />
              <h1 className="text-2xl font-bold tracking-tight">Top 10 listings</h1>
            </div>
            <BookmarkList bookmarks={topBookmarks} />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Recently bookmarks</h2>
              <span className="text-sm text-slate-500">10 per page</span>
            </div>
            <BookmarkList bookmarks={recentBookmarks} />

            {totalPages > 1 && (
              <nav className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                <Link
                  href={`/?page=${Math.max(1, page - 1)}`}
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
                  href={`/?page=${Math.min(totalPages, page + 1)}`}
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
          </section>
        </section>

        <aside className="space-y-5">
          {session && currentUser ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="text-indigo-600" size={20} />
                <h2 className="font-bold">Submit a bookmark</h2>
              </div>
              <div className="mt-4">
                <UrlBookmarkForm />
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-indigo-100 bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-bold">Join the community</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to submit links, vote, comment, and build your public profile.
              </p>
              <Link
                href="/auth"
                className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Sign in
              </Link>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
