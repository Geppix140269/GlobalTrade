import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Join — Global Trade Network",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  if (await getCurrentUser()) redirect("/members");
  const { code } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col justify-center bg-navy-900 px-4 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <span className="text-navy-100">
            <Logo size={56} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Global Trade Network</h1>
          <p className="mt-1 text-sm text-navy-200">Community Directory</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-1 text-lg font-semibold text-navy-900">Join the directory</h2>
          <p className="mb-4 text-sm text-navy-400">
            You need the invite code shared in the Community.
          </p>
          <SignupForm defaultCode={code ?? ""} />
        </div>

        <p className="mt-6 text-center text-sm text-navy-200">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
