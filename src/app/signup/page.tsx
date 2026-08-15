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
    <main className="flex min-h-screen flex-col justify-center bg-[var(--pf-inverse-ground)] px-[var(--pt-gutter)] py-[var(--pt-space-7)]">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="mb-[var(--pt-space-6)] flex flex-col items-center text-center">
          <span className="text-[var(--pf-inverse)]">
            <Logo size={52} />
          </span>
          <h1 className="gt-title mt-[var(--pt-space-4)] text-[var(--pf-inverse)]">
            Global Trade Network
          </h1>
          <p className="mt-2 font-mono text-(length:--pt-mono-band) tracking-[var(--pt-ls-band)] text-[var(--pf-inverse-mute)] uppercase">
            Community Directory
          </p>
        </div>

        <div className="bg-[var(--pf-surface)] p-[var(--pt-space-5)]">
          <h2 className="gt-heading-sub">Join the directory</h2>
          <p className="gt-prose mt-1 mb-[var(--pt-space-4)]">
            You need the invite code shared in the Community.
          </p>
          <SignupForm defaultCode={code ?? ""} />
        </div>

        <p className="mt-[var(--pt-space-5)] text-center font-sans text-(length:--pt-caption) text-[var(--pf-inverse-mute)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--pf-inverse)] underline decoration-[var(--pf-gold-rule)] underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
