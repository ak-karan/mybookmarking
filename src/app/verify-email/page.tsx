import { CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "../../lib/mongodb";
import { hashVerificationToken } from "../../lib/verification";
import User from "../../models/User";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const token = param(params.token);
  let verified = false;

  if (token) {
    await connectDB();
    const user = await User.findOne({
      emailVerificationTokenHash: hashVerificationToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (user) {
      user.emailVerified = new Date();
      user.emailVerificationTokenHash = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      verified = true;
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div
          className={`mx-auto grid size-14 place-items-center rounded-2xl ${
            verified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          {verified ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {verified ? "Email verified" : "Verification link is invalid"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {verified
            ? "Your account is active. You can now sign in and start publishing bookmarks."
            : "The link may have expired or already been used. Request a fresh verification email from the sign-in page."}
        </p>
        <Link
          href="/auth"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Go to sign in
        </Link>
      </section>
    </main>
  );
}
