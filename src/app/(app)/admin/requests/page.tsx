import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setOpportunityStatus } from "@/actions/opportunities";
import { Card, EmptyState, PageHeader, StatusPill, Tag } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";

export const metadata = { title: "Admin · Requests — Global Trade Network" };

const NEXT_STATUS: Record<string, { status: string; label: string }[]> = {
  OPEN: [
    { status: "IN_PROGRESS", label: "Mark in progress" },
    { status: "ON_HOLD", label: "Put on hold" },
  ],
  IN_PROGRESS: [
    { status: "MATCHED", label: "Mark matched" },
    { status: "ON_HOLD", label: "Put on hold" },
  ],
  MATCHED: [{ status: "CLOSED", label: "Close" }],
  ON_HOLD: [{ status: "OPEN", label: "Reopen" }],
  CLOSED: [{ status: "OPEN", label: "Reopen" }],
};

export default async function AdminRequestsPage() {
  const requests = await prisma.opportunity.findMany({
    orderBy: [{ status: "asc" }, { dateAdded: "desc" }],
    include: { relevantMembers: { select: { id: true, name: true } } },
  });

  return (
    <>
      <Link href="/admin" className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700">
        ← Back to admin
      </Link>

      <PageHeader
        title="Active Requests"
        subtitle={`${requests.length} requests`}
        action={
          <Link
            href="/admin/requests/new"
            className="rounded-lg bg-navy-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-700"
          >
            Add request
          </Link>
        }
      />

      {requests.length === 0 ? (
        <EmptyState>No requests yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={request.status} />
                  {request.type ? <Tag tone="gold">{request.type}</Tag> : null}
                  {request.market ? <Tag>{request.market}</Tag> : null}
                </div>

                <p className="text-navy-900">{request.request}</p>
                <p className="mt-2 text-sm text-navy-600">
                  {request.requesterName}
                  {request.requesterCompany ? ` · ${request.requesterCompany}` : ""}
                </p>
                {request.relevantMembers.length > 0 ? (
                  <p className="mt-1 text-xs text-navy-400">
                    Could contribute: {request.relevantMembers.map((m) => m.name).join(", ")}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/requests/${request.id}`}
                    className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                  >
                    Edit
                  </Link>
                  {(NEXT_STATUS[request.status] ?? []).map((next) => (
                    <InlineAction
                      key={next.status}
                      action={setOpportunityStatus}
                      fields={{ id: request.id, status: next.status }}
                      label={next.label}
                    />
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
