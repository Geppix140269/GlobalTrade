import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setAccountActive, setAccountRole } from "@/actions/accounts";
import { Card, EmptyState, PageHeader, StatusPill, Tag } from "@/components/ui";
import { InlineAction } from "@/components/InlineAction";
import { CreateAccountForm, ResetPasswordForm } from "@/components/AccountForm";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin · Accounts — Global Trade Network" };

export default async function AdminAccountsPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const [users, unlinkedMembers] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ email: "asc" }],
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        member: { select: { id: true, name: true } },
      },
    }),
    // Only profiles without an account can be linked — one account per member.
    prisma.member.findMany({
      where: { user: null, status: { not: "ARCHIVED" } },
      select: { id: true, name: true, company: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Link
        href="/admin"
        className="mb-3 inline-block text-sm text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
      >
        ← Back to admin
      </Link>

      <PageHeader
        title="Accounts"
        subtitle="One login per member. There is no public self-registration."
      />

      <div className="mb-5">
        <CreateAccountForm members={unlinkedMembers} />
      </div>

      {users.length === 0 ? (
        <EmptyState>No accounts yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold break-all text-[var(--pf-ink)]">{user.email}</h2>
                    <p className="mt-1 text-sm text-[var(--pf-ink-2)]">
                      {user.member ? (
                        <Link
                          href={`/members/${user.member.id}`}
                          className="underline decoration-[var(--pf-gold-rule)] underline-offset-2"
                        >
                          {user.member.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--pf-ink-3)]">No linked profile</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone={user.role === "ADMIN" ? "gold" : "plain"}>{user.role}</Tag>
                    <StatusPill status={user.isActive ? "ACTIVE" : "INACTIVE"} />
                  </div>
                </div>

                {user.mustChangePassword ? (
                  <p className="mt-2 text-xs text-[var(--pf-gold-ink)]">
                    Password was set by an admin and has not been changed yet.
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineAction
                    action={setAccountActive}
                    fields={{ userId: user.id, isActive: user.isActive ? "false" : "true" }}
                    label={user.isActive ? "Disable access" : "Enable access"}
                    tone={user.isActive ? "danger" : "neutral"}
                  />
                  <InlineAction
                    action={setAccountRole}
                    fields={{ userId: user.id, role: user.role === "ADMIN" ? "MEMBER" : "ADMIN" }}
                    label={user.role === "ADMIN" ? "Make member" : "Make admin"}
                  />
                </div>

                <ResetPasswordForm userId={user.id} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
