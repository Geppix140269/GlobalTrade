import Link from "next/link";
import { createMember } from "@/actions/profile";
import { MemberForm } from "@/components/MemberForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin · Add member — Global Trade Network" };

export default async function NewMemberPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  return (
    <>
      <Link
        href="/admin/members"
        className="mb-3 inline-block text-sm text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
      >
        ← Back to members
      </Link>
      <PageHeader
        title="Add member"
        subtitle="Create the profile first, then issue a login from the Accounts page."
      />
      <MemberForm action={createMember} submitLabel="Add member" showStatus />
    </>
  );
}
