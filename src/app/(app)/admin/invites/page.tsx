import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { checkInvite } from "@/lib/invites";
import { setInviteActive } from "@/actions/invites";
import { Card, EmptyState, PageHeader, StatusPill, Tag } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";
import { CreateInviteForm } from "@/components/InviteForm";

export const metadata = { title: "Admin · Invite codes — Global Trade Network" };

export default async function AdminInvitesPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const [invites, claimable, headerList] = await Promise.all([
    prisma.inviteCode.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { member: { select: { id: true, name: true } } },
    }),
    // Only profiles nobody owns yet can be claimed.
    prisma.member.findMany({
      where: { user: null, status: { not: "ARCHIVED" } },
      select: { id: true, name: true, company: true },
      orderBy: { name: "asc" },
    }),
    headers(),
  ]);

  const host = headerList.get("host") ?? "";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";
  const linkFor = (code: string) => `${origin}/signup?code=${code}`;

  const unclaimedWithoutCode = claimable.filter(
    (m) => !invites.some((i) => i.memberId === m.id && i.isActive),
  );

  return (
    <>
      <Link href="/admin" className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700">
        ← Back to admin
      </Link>

      <PageHeader
        title="Invite codes"
        subtitle="Members join themselves with a code. No code, no account."
      />

      {unclaimedWithoutCode.length > 0 ? (
        <div className="mb-5 rounded-xl border border-gold-300 bg-gold-100 p-4">
          <h2 className="text-sm font-semibold text-gold-600">
            {unclaimedWithoutCode.length} profile
            {unclaimedWithoutCode.length === 1 ? "" : "s"} nobody owns yet
          </h2>
          <p className="mt-1 text-sm text-navy-700">
            {unclaimedWithoutCode.map((m) => m.name).join(", ")}. If you send these people the
            shared code they will create a second, empty profile. Issue each of them a claim code
            below instead, so they take over the profile already in the directory.
          </p>
        </div>
      ) : null}

      <div className="mb-5">
        <CreateInviteForm members={claimable} />
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
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        {invite.member ? (
                          <Tag tone="gold">Claim code for {invite.member.name}</Tag>
                        ) : null}
                        {invite.role === "ADMIN" ? <Tag tone="gold">Grants admin</Tag> : null}
                      </div>
                      {invite.label ? (
                        <p className="mt-1 text-sm text-navy-600">{invite.label}</p>
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

                  {usable && origin ? (
                    <div className="mt-3 rounded-lg border border-navy-100 bg-navy-50 p-2.5">
                      <p className="text-xs font-medium text-navy-400">Link to share</p>
                      <p className="mt-0.5 font-mono text-xs break-all text-navy-800 select-all">
                        {linkFor(invite.code)}
                      </p>
                    </div>
                  ) : null}

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
