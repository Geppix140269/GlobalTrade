import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMemberAsAdmin } from "@/actions/profile";
import { MemberForm } from "@/components/MemberForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/session";

export default async function AdminEditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <>
      <Link
        href="/admin/members"
        className="mb-3 inline-block text-sm text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
      >
        ← Back to members
      </Link>
      <PageHeader
        title={`Edit ${member.name}`}
        subtitle="Admin correction. The member can also maintain these fields themselves."
      />
      <MemberForm
        action={updateMemberAsAdmin}
        member={member}
        submitLabel="Save member"
        showStatus
      />
    </>
  );
}
