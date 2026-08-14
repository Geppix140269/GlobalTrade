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
        <Card className="p-5 text-sm text-navy-700">
          <p>
            This account is not linked to a member profile, so there is nothing to edit here. If you
            should have a profile in the directory, please contact the Community administrator.
          </p>
          <Link
            href="/members"
            className="mt-3 inline-block text-navy-400 hover:text-navy-700"
          >
            ← Back to members
          </Link>
        </Card>
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
            className="rounded-lg border border-navy-200 bg-white px-3.5 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            View as others see it
          </Link>
        }
      />

      {!completion.complete ? (
        <div className="mb-4 rounded-xl border border-gold-300 bg-gold-100 p-4">
          <h2 className="text-sm font-semibold text-gold-600">Complete your profile</h2>
          <p className="mt-1 text-sm text-navy-700">
            Still missing: {completion.missing.join(", ")}.
          </p>
        </div>
      ) : null}

      <MemberForm action={updateMyProfile} member={member} submitLabel="Save my profile" />

      <p className="mt-6 text-center text-sm text-navy-400">
        <Link href="/profile/password" className="hover:text-navy-700">
          Change my password
        </Link>
      </p>
    </>
  );
}
