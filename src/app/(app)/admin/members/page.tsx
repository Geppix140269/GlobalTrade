import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setMemberStatus } from "@/actions/profile";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin · Members — Global Trade Network" };

export default async function AdminMembersPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const members = await prisma.member.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { user: { select: { id: true, email: true, isActive: true } } },
  });

  return (
    <>
      <Link href="/admin" className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700">
        ← Back to admin
      </Link>

      <PageHeader
        title="Members"
        subtitle={`${members.length} profiles`}
        action={
          <Link
            href="/admin/members/new"
            className="rounded-lg bg-navy-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-700"
          >
            Add member
          </Link>
        }
      />

      {members.length === 0 ? (
        <EmptyState>No members yet. Add the first profile to start the directory.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-navy-900">{member.name}</h2>
                    <p className="text-sm text-navy-600">
                      {[member.roleTitle, member.company].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-navy-400">
                      {member.user
                        ? `Login: ${member.user.email}${member.user.isActive ? "" : " (disabled)"}`
                        : "No login account yet"}
                    </p>
                  </div>
                  <StatusPill status={member.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                  >
                    Edit
                  </Link>
                  {member.status === "ACTIVE" ? (
                    <>
                      <InlineAction
                        action={setMemberStatus}
                        fields={{ memberId: member.id, status: "INACTIVE" }}
                        label="Deactivate"
                      />
                      <InlineAction
                        action={setMemberStatus}
                        fields={{ memberId: member.id, status: "ARCHIVED" }}
                        label="Archive"
                        tone="danger"
                      />
                    </>
                  ) : (
                    <InlineAction
                      action={setMemberStatus}
                      fields={{ memberId: member.id, status: "ACTIVE" }}
                      label="Reactivate"
                    />
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
