import {
  BookOpen,
  Calendar,
  ExternalLink,
  Globe2,
  KeyRound,
  Link2,
  Mail,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardButton, SignOutButton } from "../../components/auth-buttons";
import { requireCurrentUser, userHasAdminAccess } from "../../lib/access";
import Bookmark from "../../models/Bookmark";
import {
  changePassword,
  deleteUserBookmark,
  updateDashboardProfile,
  updateUserBookmark,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatDate(value?: Date | string) {
  if (!value) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function inputDate(value?: Date | string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const updated = param(params.updated);
  const user = await requireCurrentUser();

  if (!user.email) {
    redirect("/auth");
  }

  const [bookmarkCount, commentCount, userBookmarks, isAdmin] = await Promise.all([
    Bookmark.countDocuments({ user: user._id }),
    Bookmark.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: "$commentCount" } } },
    ]),
    Bookmark.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select("title url description tags categories score commentCount createdAt")
      .lean(),
    userHasAdminAccess(user),
  ]);

  const totalComments = Number(commentCount[0]?.total ?? 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <Link2 size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">LinkHive</span>
              <span className="block text-xs text-slate-500">Account dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex"
            >
              Feed
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                Admin
              </Link>
            )}
            <DashboardButton />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
                <UserRound size={26} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold">{user.name ?? "Member"}</h1>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} />
                DOB: {formatDate(user.birthDate)}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={16} />
                {isAdmin ? "Admin access" : "Customer account"}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Bookmarks</p>
              <p className="mt-2 text-2xl font-bold">{bookmarkCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Comments</p>
              <p className="mt-2 text-2xl font-bold">{totalComments}</p>
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          {updated && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {updated === "password" ? "Password updated successfully." : "Profile updated successfully."}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <UserRound className="text-indigo-600" size={20} />
                <h2 className="font-bold">Profile details</h2>
              </div>
              <form action={updateDashboardProfile} className="mt-5 grid gap-4">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Name</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={user.name ?? ""}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email</span>
                  <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                    <Mail size={16} />
                    {user.email}
                  </span>
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Date of birth</span>
                  <input
                    name="birthDate"
                    type="date"
                    defaultValue={inputDate(user.birthDate)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Website</span>
                  <input
                    name="website"
                    type="url"
                    defaultValue={user.website ?? ""}
                    placeholder="https://example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Facebook</span>
                    <input
                      name="facebook"
                      type="url"
                      defaultValue={user.facebook ?? ""}
                      placeholder="https://facebook.com/username"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Instagram</span>
                    <input
                      name="instagram"
                      type="url"
                      defaultValue={user.instagram ?? ""}
                      placeholder="https://instagram.com/username"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">LinkedIn</span>
                    <input
                      name="linkedin"
                      type="url"
                      defaultValue={user.linkedin ?? ""}
                      placeholder="https://linkedin.com/in/username"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Twitter/X</span>
                    <input
                      name="twitter"
                      type="url"
                      defaultValue={user.twitter ?? ""}
                      placeholder="https://x.com/username"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Bio</span>
                  <textarea
                    name="bio"
                    rows={4}
                    maxLength={280}
                    defaultValue={user.bio ?? ""}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <button className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">
                  Save profile
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="text-violet-600" size={20} />
                <h2 className="font-bold">Password security</h2>
              </div>
              <form action={changePassword} className="mt-5 grid gap-4">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Current password
                  </span>
                  <input
                    name="currentPassword"
                    type="password"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                    placeholder="Required for email accounts"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">New password</span>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Confirm new password
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                  />
                </label>
                <button className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                  Update password
                </button>
              </form>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="text-emerald-600" size={20} />
                <h2 className="font-bold">Your listings ({bookmarkCount})</h2>
              </div>
              <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Add new
              </Link>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              {userBookmarks.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No bookmarks yet. Start by publishing your first useful link.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {userBookmarks.map((bookmark) => (
                    <article
                      key={bookmark._id.toString()}
                      className="grid gap-4 p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 font-semibold text-slate-950 hover:text-indigo-600"
                          >
                            {bookmark.title}
                            <ExternalLink size={14} />
                          </a>
                          <p className="mt-1 truncate text-sm text-slate-500">{bookmark.url}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {bookmark.score} score / {bookmark.commentCount} comments
                          </p>
                        </div>
                        <form action={deleteUserBookmark.bind(null, bookmark._id.toString())}>
                          <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </form>
                      </div>

                      <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                          <Pencil size={15} />
                          Edit listing
                        </summary>
                        <form
                          action={updateUserBookmark.bind(null, bookmark._id.toString())}
                          className="mt-4 grid gap-3"
                        >
                          <input
                            name="title"
                            required
                            minLength={3}
                            maxLength={160}
                            defaultValue={bookmark.title}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                          />
                          <input
                            name="url"
                            type="url"
                            required
                            defaultValue={bookmark.url}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                          />
                          <textarea
                            name="description"
                            rows={3}
                            maxLength={500}
                            defaultValue={bookmark.description ?? ""}
                            className="resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              name="categories"
                              defaultValue={bookmark.categories.join(", ")}
                              placeholder="Categories"
                              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                            />
                            <input
                              name="tags"
                              defaultValue={bookmark.tags.join(", ")}
                              placeholder="Tags"
                              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                            />
                          </div>
                          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">
                            <Globe2 size={15} />
                            Save listing
                          </button>
                        </form>
                      </details>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
