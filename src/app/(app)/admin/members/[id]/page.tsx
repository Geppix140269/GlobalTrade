import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMemberAsAdmin } from "@/actions/profile";
import { MemberForm } from "@/components/MemberForm";
import { PageHeader } from "@/components/ui";

export default async function AdminEditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <>
      <Link
        href="/admin/members"
        className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700"
      >
        ← Back to members
      </Link>
      <PageHeader
        title={`Edit ${member.name}`}
        subtitle="Admin correction. The member can also maintain these fields themselves."
      />
      <MemberForm action={updateMemberAsAdmin} member={member} submitLabel="Save member" showStatus />
    </>
  );
}
