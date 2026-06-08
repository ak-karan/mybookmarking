import { BookOpen, Calendar, Globe2, Link2, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Bookmark from "../../../models/Bookmark";
import User from "../../../models/User";

type Params = Promise<{ id: string }>;

function formatDate(value?: Date | string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function PublicUserPage({ params }: { params: Params }) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    notFound();
  }

  await connectDB();
  const [user, bookmarks] = await Promise.all([
    User.findById(id).select("name image bio website facebook instagram linkedin twitter createdAt").lean(),
    Bookmark.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("title url description tags categories score savedCount commentCount createdAt")
      .lean(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
              <Link2 size={18} />
            </span>
            LinkHive
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            Browse bookmarks
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
              <UserRound size={34} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{user.name ?? "LinkHive member"}</h1>
              {user.bio && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{user.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={15} />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-600"
                  >
                    <Globe2 size={15} />
                    Website
                  </a>
                )}
                {[
                  ["Facebook", user.facebook],
                  ["Instagram", user.instagram],
                  ["LinkedIn", user.linkedin],
                  ["Twitter/X", user.twitter],
                ]
                  .filter(([, url]) => Boolean(url))
                  .map(([label, url]) => (
                    <a
                      key={label}
                      href={String(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-indigo-600"
                    >
                      <Globe2 size={15} />
                      {label}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold">Published bookmarks</h2>
            <span className="text-sm text-slate-400">({bookmarks.length})</span>
          </div>

          <div className="mt-4 grid gap-4">
            {bookmarks.map((bookmark) => (
              <article
                key={bookmark._id.toString()}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-bold text-slate-950 hover:text-indigo-600"
                >
                  {bookmark.title}
                </a>
                <p className="mt-1 truncate text-xs text-slate-400">{bookmark.url}</p>
                {bookmark.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{bookmark.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {bookmark.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {category}
                    </span>
                  ))}
                  {bookmark.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-violet-600">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{formatDate(bookmark.createdAt)}</span>
                  <span>{bookmark.score} score</span>
                  <span>{bookmark.savedCount ?? 0} saved</span>
                  <span>{bookmark.commentCount} comments</span>
                </div>
              </article>
            ))}

            {bookmarks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                This member has not published any bookmarks yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
