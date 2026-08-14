import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createOpportunity } from "@/actions/opportunities";
import { OpportunityForm } from "@/components/OpportunityForm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Admin · Add request — Global Trade Network" };

export default async function NewRequestPage() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Link
        href="/admin/requests"
        className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700"
      >
        ← Back to requests
      </Link>
      <PageHeader
        title="Add request"
        subtitle="Curate a request raised in the Community so it does not get lost."
      />
      <OpportunityForm action={createOpportunity} members={members} submitLabel="Add request" />
    </>
  );
}
