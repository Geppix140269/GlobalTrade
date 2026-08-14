import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOpportunity } from "@/actions/opportunities";
import { OpportunityForm } from "@/components/OpportunityForm";
import { PageHeader } from "@/components/ui";

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [opportunity, members] = await Promise.all([
    prisma.opportunity.findUnique({
      where: { id },
      include: { relevantMembers: { select: { id: true } } },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, company: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!opportunity) notFound();

  return (
    <>
      <Link
        href="/admin/requests"
        className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700"
      >
        ← Back to requests
      </Link>
      <PageHeader title="Edit request" />
      <OpportunityForm
        action={updateOpportunity}
        members={members}
        opportunity={{
          id: opportunity.id,
          requesterId: opportunity.requesterId,
          requesterName: opportunity.requesterName,
          requesterCompany: opportunity.requesterCompany,
          type: opportunity.type,
          market: opportunity.market,
          request: opportunity.request,
          supportNeeded: opportunity.supportNeeded,
          notes: opportunity.notes,
          status: opportunity.status,
          relevantMemberIds: opportunity.relevantMembers.map((m) => m.id),
        }}
      />
    </>
  );
}
