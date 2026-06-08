import { Mail, MessageSquare } from "lucide-react";
import { SiteHeader } from "../../components/site-header";
import { submitContactQuery } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const sent = param(params.sent);

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader subtitle="Contact support" />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
              <MessageSquare size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Contact</h1>
              <p className="text-sm text-slate-500">Apni query submit karein. Admin dashboard me show hogi.</p>
            </div>
          </div>

          {sent && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Query submit ho gayi hai.
            </div>
          )}

          <form action={submitContactQuery} className="mt-6 grid gap-4">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Name</span>
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-3 text-slate-400" size={17} />
                <input
                  name="email"
                  type="email"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-indigo-400"
                />
              </span>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Subject</span>
              <input
                name="subject"
                required
                minLength={3}
                maxLength={160}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Query</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={1500}
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </label>
            <button className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">
              Submit query
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
