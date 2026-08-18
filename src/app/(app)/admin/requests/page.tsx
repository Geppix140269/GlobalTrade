import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setOpportunityStatus } from "@/actions/opportunities";
import { Card, EmptyState, PageHeader, StatusPill, Tag } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin · Requests · Global Trade Network" };

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
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const requests = await prisma.opportunity.findMany({
    orderBy: [{ status: "asc" }, { dateAdded: "desc" }],
    include: { relevantMembers: { select: { id: true, name: true } } },
  });

  return (
    <>
      <Link
        href="/admin"
        className="mb-3 inline-block text-sm text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
      >
        ← Back to admin
      </Link>

      <PageHeader
        title="Active Requests"
        subtitle={`${requests.length} requests`}
        action={
          <Link
            href="/admin/requests/new"
            className="bg-[var(--pf-ink)] px-3.5 py-2 text-sm font-medium text-[var(--pf-panel-ink)] hover:bg-[var(--pf-ink-2)]"
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

                <p className="text-[var(--pf-ink)]">{request.request}</p>
                <p className="mt-2 text-sm text-[var(--pf-ink-2)]">
                  {request.requesterName}
                  {request.requesterCompany ? ` · ${request.requesterCompany}` : ""}
                </p>
                {request.relevantMembers.length > 0 ? (
                  <p className="mt-1 text-xs text-[var(--pf-ink-3)]">
                    Could contribute: {request.relevantMembers.map((m) => m.name).join(", ")}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/requests/${request.id}`}
                    className="border border-[var(--pf-rule-strong)] bg-[var(--pf-raised)] px-3 py-1.5 text-sm font-medium text-[var(--pf-ink-2)] hover:bg-[var(--pf-sunken)]"
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
