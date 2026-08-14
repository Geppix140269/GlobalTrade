import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { Card, EmptyState, PageHeader, StatusPill, Tag, inputClass } from "@/components/ui";

export const metadata = { title: "Active Requests — Global Trade Network" };

const STATUSES = ["OPEN", "IN_PROGRESS", "MATCHED", "ON_HOLD", "CLOSED"] as const;

interface SearchParams {
  status?: string;
  type?: string;
  market?: string;
  requester?: string;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const actor = await requireUser();
  const params = await searchParams;

  const and: Prisma.OpportunityWhereInput[] = [];
  if (params.status && STATUSES.includes(params.status as (typeof STATUSES)[number])) {
    and.push({ status: params.status as (typeof STATUSES)[number] });
  }
  if (params.type) and.push({ type: params.type });
  if (params.market) and.push({ market: params.market });
  if (params.requester) and.push({ requesterName: params.requester });

  const [requests, all] = await Promise.all([
    prisma.opportunity.findMany({
      where: and.length > 0 ? { AND: and } : {},
      include: { requester: { select: { id: true, name: true } }, relevantMembers: true },
      orderBy: [{ status: "asc" }, { dateAdded: "desc" }],
    }),
    prisma.opportunity.findMany({ select: { type: true, market: true, requesterName: true } }),
  ]);

  const distinct = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const types = distinct(all.map((o) => o.type));
  const markets = distinct(all.map((o) => o.market));
  const requesters = distinct(all.map((o) => o.requesterName));
  const filtered = Boolean(params.status || params.type || params.market || params.requester);

  return (
    <>
      <PageHeader
        title="Active Requests"
        subtitle="Opportunities and needs raised by Community members."
        action={
          isAdmin(actor) ? (
            <Link
              href="/admin/requests"
              className="rounded-lg border border-navy-200 bg-white px-3.5 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
            >
              Manage requests
            </Link>
          ) : undefined
        }
      />

      <Card className="mb-5 p-3 sm:p-4">
        <form method="get" className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select
              className={inputClass}
              name="status"
              defaultValue={params.status ?? ""}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              name="type"
              defaultValue={params.type ?? ""}
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              name="market"
              defaultValue={params.market ?? ""}
              aria-label="Filter by market"
            >
              <option value="">All markets</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              name="requester"
              defaultValue={params.requester ?? ""}
              aria-label="Filter by requester"
            >
              <option value="">All requesters</option>
              {requesters.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-navy-800 px-4 py-2.5 font-medium text-white hover:bg-navy-700 sm:flex-none"
            >
              Apply
            </button>
            {filtered ? (
              <Link
                href="/requests"
                className="flex-1 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-center font-medium text-navy-700 hover:bg-navy-50 sm:flex-none"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </Card>

      {requests.length === 0 ? (
        <EmptyState>No requests match these filters.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={request.status} />
                  {request.type ? <Tag tone="gold">{request.type}</Tag> : null}
                  {request.market ? <Tag>{request.market}</Tag> : null}
                  <span className="ml-auto text-xs text-navy-400">
                    {request.dateAdded.toISOString().slice(0, 10)}
                  </span>
                </div>

                <p className="text-navy-900">{request.request}</p>

                {request.supportNeeded ? (
                  <p className="mt-2 text-sm text-navy-700">
                    <span className="font-medium text-navy-400">Support needed: </span>
                    {request.supportNeeded}
                  </p>
                ) : null}

                {request.notes ? (
                  <p className="mt-2 text-sm text-navy-400">{request.notes}</p>
                ) : null}

                <p className="mt-3 text-sm text-navy-600">
                  {request.requester ? (
                    <Link
                      href={`/members/${request.requester.id}`}
                      className="font-medium underline decoration-gold-300 underline-offset-2"
                    >
                      {request.requesterName}
                    </Link>
                  ) : (
                    <span className="font-medium">{request.requesterName}</span>
                  )}
                  {request.requesterCompany ? ` · ${request.requesterCompany}` : ""}
                </p>

                {request.relevantMembers.length > 0 ? (
                  <div className="mt-3 border-t border-navy-100 pt-3">
                    <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">
                      Members who could contribute
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {request.relevantMembers.map((member) => (
                        <Link key={member.id} href={`/members/${member.id}`}>
                          <Tag>{member.name}</Tag>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
