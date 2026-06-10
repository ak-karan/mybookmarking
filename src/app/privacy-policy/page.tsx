import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyBookmark collects, uses, protects, and manages personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm font-semibold text-indigo-700">Last updated: June 10, 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 leading-7 text-slate-600">
          MyBookmark collects only the information needed to operate accounts, publish listings,
          protect the community, and improve the service.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-950">Information we collect</h2>
            <p className="mt-2">
              Account details may include name, email address, date of birth, profile information,
              Google profile details when OAuth is used, and a securely hashed password when one is
              created. We also store submitted bookmarks, categories, comments, votes, saved items,
              contact requests, and basic security or session information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">How information is used</h2>
            <p className="mt-2">
              We use information to authenticate users, display public profiles and listings,
              provide account support, prevent abuse, send requested account emails, maintain
              security, and understand service performance.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Sharing and third parties</h2>
            <p className="mt-2">
              We do not sell personal information. Limited data may be processed by hosting,
              database, authentication, and email providers required to run the service. Public
              profile and listing information is visible to visitors by design.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Security and retention</h2>
            <p className="mt-2">
              Passwords are stored as hashes rather than readable text. Reset links use expiring,
              one-time token hashes. Information is retained while an account is active or as
              reasonably needed for security, legal compliance, dispute resolution, and abuse
              prevention.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Your choices</h2>
            <p className="mt-2">
              Users may update profile details and delete their own listings from the dashboard.
              Requests to access, correct, or delete account information can be submitted through
              the Contact page. We may verify identity before completing a request.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Children and policy changes</h2>
            <p className="mt-2">
              Users should not provide false age information. We may restrict or remove accounts
              where legally required. This policy may be updated as the service, providers, or
              applicable requirements change.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
