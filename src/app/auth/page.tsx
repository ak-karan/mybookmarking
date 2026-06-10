import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "../../components/auth-panel";
import { auth } from "../../lib/auth";

export const metadata: Metadata = {
  title: "Sign In or Create Account",
  description: "Sign in to MyBookmark or create an account to publish and manage useful links.",
  robots: { index: false, follow: false },
};

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <Link href="/">
          <Image src="/logo.jpg" alt="MyBookmark" width={260} height={70} className="h-auto w-[180px]" />
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
          Back to feed
        </Link>
      </div>
      <div className="mx-auto grid max-w-5xl place-items-center">
        <AuthPanel />
      </div>
    </main>
  );
}
