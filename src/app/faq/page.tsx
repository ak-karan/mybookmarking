import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about submitting, managing, and reporting bookmarks on MyBookmark.",
};

const questions = [
  ["How do I submit a bookmark?", "Sign in, select Submit from the main menu, enter a public URL, choose a category, and publish it. MyBookmark can fetch basic page details for you."],
  ["Why is a category required?", "A category helps people discover relevant listings and organize the directory. Title, description, and keywords remain optional."],
  ["Can I customize the fetched information?", "Yes. After fetching a URL, you can replace or add your own title, description, and keywords before submitting."],
  ["What happens if the URL already exists?", "Duplicate public URLs are not published again. Use your dashboard to find and manage listings you have already submitted."],
  ["Can Google sign-in users create a password?", "Yes. A user who joined with Google can use password reset for the same email address to create a secure password for direct sign-in."],
  ["How do I reset my password?", "Open the sign-in page, choose Forgot password, and follow the secure link sent to your registered email address."],
  ["Can I edit or remove my listings?", "Yes. Open your dashboard to update supported listing details or remove a listing that belongs to your account."],
  ["How are top categories selected?", "The sidebar shows up to ten categories with the largest number of published listings. Counts update as listings are added or removed."],
  ["What content is not allowed?", "Illegal, abusive, fraudulent, pirated, dangerous, exploitative, or harmful content is prohibited. See the Terms & Conditions for examples."],
  ["How do I report a harmful listing?", "Use the contact page and include the listing URL plus a short explanation. We may remove content or restrict accounts after review."],
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-7">
          <p className="text-sm font-semibold text-indigo-700">Help center</p>
          <h1 className="mt-2 text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Quick answers about accounts, submissions, categories, and moderation.
          </p>
        </header>
        <div className="divide-y divide-slate-200 py-4">
          {questions.map(([question, answer]) => (
            <details key={question} className="py-5">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">
                {question}
              </summary>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
