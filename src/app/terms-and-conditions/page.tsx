import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Rules for accounts, bookmark submissions, acceptable use, and moderation on MyBookmark.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm font-semibold text-indigo-700">Last updated: June 10, 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="mt-4 leading-7 text-slate-600">
          By using MyBookmark, you agree to use the service lawfully, responsibly, and without
          harming other users or third parties.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-950">Accounts</h2>
            <p className="mt-2">
              Provide accurate information, keep credentials secure, and remain responsible for
              activity performed through your account. Do not impersonate another person or create
              accounts for fraud, spam, or evasion of enforcement.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Prohibited content</h2>
            <p className="mt-2">
              Do not submit links or content involving child sexual abuse, non-consensual intimate
              material, human trafficking, terrorist recruitment, stolen credentials, financial
              fraud, malware, phishing, illegal marketplaces, unlawful threats, or instructions
              intended to facilitate serious wrongdoing.
            </p>
            <p className="mt-2">
              Copyright-infringing, pirated, deceptive, hateful, abusive, privacy-violating, or
              spam content may also be removed. A category selection does not make prohibited
              material acceptable.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Listings and moderation</h2>
            <p className="mt-2">
              You must have the right to share submitted content and should describe links
              honestly. We may review, reject, hide, edit, or remove listings and accounts to
              enforce these terms, respond to complaints, protect users, or comply with lawful
              requests.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Third-party websites</h2>
            <p className="mt-2">
              MyBookmark indexes links submitted by users. We do not control external websites and
              do not guarantee their accuracy, availability, safety, legality, products, or
              privacy practices. Visit third-party links at your own discretion.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Service availability and liability</h2>
            <p className="mt-2">
              The service is provided on an as-available basis. Features may change, pause, or end.
              To the extent permitted by applicable law, MyBookmark is not responsible for losses
              caused by user submissions, external sites, unauthorized account use, or temporary
              service interruption.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Reporting and termination</h2>
            <p className="mt-2">
              Report unlawful or harmful material through the Contact page with the listing URL and
              reason. We may suspend or terminate access for violations, repeated complaints,
              security risks, or legal requirements.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
