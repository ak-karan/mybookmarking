import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "../../components/auth-panel";
import { auth } from "../../lib/auth";

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
          LinkHive
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
