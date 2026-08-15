import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Change password — Global Trade Network" };

export default async function PasswordPage() {
  await requireUser();

  return (
    <>
      <Link
        href="/profile"
        className="mb-3 inline-block text-sm text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
      >
        ← Back to my profile
      </Link>
      <PageHeader title="Change password" />
      <PasswordForm />
    </>
  );
}
