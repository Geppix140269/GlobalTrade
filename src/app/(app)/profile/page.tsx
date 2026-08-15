import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileCompletion } from "@/lib/members";
import { updateMyProfile } from "@/actions/profile";
import { MemberForm } from "@/components/MemberForm";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "My Profile — Global Trade Network" };

export default async function ProfilePage() {
  const actor = await requireUser();

  const member = actor.memberId
    ? await prisma.member.findUnique({ where: { id: actor.memberId } })
    : null;

  if (!member) {
    return (
      <>
        <PageHeader title="My Profile" />
        <Card className="p-5 text-sm text-[var(--pf-ink-2)]">
          <p>
            This account is not linked to a member profile, so there is no profile to edit here.
            Admin accounts do not need one. To appear in the directory yourself, create a member
            profile under Admin → Members and link it to this account from Admin → Accounts.
          </p>
          <Link
            href="/members"
            className="mt-3 inline-block text-[var(--pf-ink-3)] hover:text-[var(--pf-ink-2)]"
          >
            ← Back to members
          </Link>
        </Card>

        {/* Every account can change its own password, profile or not. */}
        <PasswordLink />
      </>
    );
  }

  const completion = profileCompletion(member);

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Keep this up to date so other members know how to work with you."
        action={
          <Link
            href={`/members/${member.id}`}
            className="border border-[var(--pf-rule-strong)] bg-[var(--pf-raised)] px-3.5 py-2 text-sm font-medium text-[var(--pf-ink-2)] hover:bg-[var(--pf-sunken)]"
          >
            View as others see it
          </Link>
        }
      />

      {!completion.complete ? (
        <div className="mb-4 border border-[var(--pf-gold-rule)] bg-[var(--pf-sunken)] p-4">
          <h2 className="text-sm font-semibold text-[var(--pf-gold-ink)]">Complete your profile</h2>
          <p className="mt-1 text-sm text-[var(--pf-ink-2)]">
            Still missing: {completion.missing.join(", ")}.
          </p>
        </div>
      ) : null}

      <MemberForm action={updateMyProfile} member={member} submitLabel="Save my profile" />

      <PasswordLink />
    </>
  );
}

function PasswordLink() {
  return (
    <p className="mt-6 text-center text-sm">
      <Link
        href="/profile/password"
        className="font-medium text-[var(--pf-ink-2)] underline decoration-[var(--pf-gold-rule)] underline-offset-4 hover:text-[var(--pf-ink)]"
      >
        Change my password
      </Link>
    </p>
  );
}
