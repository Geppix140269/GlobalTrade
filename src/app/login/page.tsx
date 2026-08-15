import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Global Trade Network" };

/**
 * The door. It stands on the inverse ground — ink — with the form itself on
 * paper, so the one thing to do on the page is the one lit surface.
 */
export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/members");

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
          <LoginForm />
        </div>

        <p className="mt-[var(--pt-space-5)] text-center font-sans text-(length:--pt-caption) text-[var(--pf-inverse-mute)]">
          Have an invite code?{" "}
          <Link
            href="/signup"
            className="text-[var(--pf-inverse)] underline decoration-[var(--pf-gold-rule)] underline-offset-4"
          >
            Join the directory
          </Link>
        </p>
      </div>
    </main>
  );
}
