import Link from "next/link";
import { createMember } from "@/actions/profile";
import { MemberForm } from "@/components/MemberForm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Admin · Add member — Global Trade Network" };

export default function NewMemberPage() {
  return (
    <>
      <Link
        href="/admin/members"
        className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700"
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
