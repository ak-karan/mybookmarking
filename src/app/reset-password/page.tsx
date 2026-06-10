import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PasswordResetForm } from "../../components/password-reset-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset or create your MyBookmark account password.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = param(params.token);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60">
        <Link href="/" className="inline-flex">
          <Image src="/logo.jpg" alt="MyBookmark" width={260} height={70} className="h-auto w-[180px]" />
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {token ? "Set a new password" : "Reset your password"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {token
            ? "Choose a secure password with at least one letter and one number."
            : "Enter your account email and we will send a secure reset link."}
        </p>
        <PasswordResetForm token={token} />
      </section>
    </main>
  );
}
