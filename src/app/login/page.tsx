import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Global Trade Network" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/members");

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
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-navy-400">
          Access is by invitation. Contact the Community administrator for an account.
        </p>
      </div>
    </main>
  );
}
