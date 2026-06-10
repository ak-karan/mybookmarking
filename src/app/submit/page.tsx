import { BookmarkPlus, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import { UrlBookmarkForm } from "../../components/url-bookmark-form";
import { requireCurrentUser } from "../../lib/access";

export const metadata: Metadata = {
  title: "Submit a Bookmark",
  description: "Publish a useful website in the MyBookmark community directory.",
  robots: { index: false, follow: false },
};

export default async function SubmitPage() {
  await requireCurrentUser();

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
            <BookmarkPlus size={18} />
            New listing
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Submit a bookmark</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Fetch page details automatically or enter your own title, description, and keywords.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <UrlBookmarkForm />
        </section>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <ShieldCheck className="mt-0.5 shrink-0" size={18} />
          Listings containing illegal, fraudulent, abusive, pirated, or harmful content may be
          rejected or removed without notice.
        </div>
      </div>
    </main>
  );
}
