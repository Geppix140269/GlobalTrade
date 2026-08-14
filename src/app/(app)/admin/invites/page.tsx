import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { checkInvite } from "@/lib/invites";
import { setInviteActive } from "@/actions/invites";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";
import { CreateInviteForm } from "@/components/InviteForm";

export const metadata = { title: "Admin · Invite codes — Global Trade Network" };

export default async function AdminInvitesPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const invites = await prisma.inviteCode.findMany({ orderBy: [{ createdAt: "desc" }] });

  return (
    <>
      <Link href="/admin" className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700">
        ← Back to admin
      </Link>

      <PageHeader
        title="Invite codes"
        subtitle="Members join themselves with a code. No code, no account."
      />

      <div className="mb-5">
        <CreateInviteForm />
      </div>

      {invites.length === 0 ? (
        <EmptyState>No invite codes yet. Create one to let members sign themselves up.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {invites.map((invite) => {
            const usable = checkInvite(invite).ok;
            const uses = invite.maxUses === null ? "unlimited" : `${invite.maxUses}`;
            return (
              <li key={invite.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-lg font-semibold tracking-wider break-all text-navy-900">
                        {invite.code}
                      </p>
                      {invite.label ? (
                        <p className="text-sm text-navy-600">{invite.label}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-navy-400">
                        Used {invite.usedCount} of {uses}
                        {invite.expiresAt
                          ? ` · expires ${invite.expiresAt.toISOString().slice(0, 10)}`
                          : " · never expires"}
                      </p>
                    </div>
                    <StatusPill status={usable ? "ACTIVE" : "INACTIVE"} />
                  </div>

                  <div className="mt-3">
                    <InlineAction
                      action={setInviteActive}
                      fields={{ id: invite.id, isActive: invite.isActive ? "false" : "true" }}
                      label={invite.isActive ? "Disable code" : "Enable code"}
                      tone={invite.isActive ? "danger" : "neutral"}
                    />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
