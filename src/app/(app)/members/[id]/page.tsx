import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { canEditMember, isAdmin } from "@/lib/authz";
import { Card, DetailBlock, PageHeader, StatusPill, Tag } from "@/components/ui";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireUser();
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      requests: { where: { status: { not: "CLOSED" } }, orderBy: { dateAdded: "desc" } },
      relevantFor: { where: { status: { not: "CLOSED" } }, orderBy: { dateAdded: "desc" } },
    },
  });

  // Deactivated and archived profiles stay visible to the admin only.
  if (!member || (member.status !== "ACTIVE" && !isAdmin(actor))) notFound();

  const canEdit = canEditMember(actor, member.id);
  const isOwnProfile = actor.memberId === member.id;
  const contact = [
    member.email ? { label: "Email", value: member.email, href: `mailto:${member.email}` } : null,
    member.phone
      ? {
          label: "Telephone / WhatsApp",
          value: member.phone,
          href: `https://wa.me/${member.phone.replace(/[^\d]/g, "")}`,
        }
      : null,
    member.website ? { label: "Website", value: member.website, href: member.website } : null,
    member.linkedin ? { label: "LinkedIn", value: member.linkedin, href: member.linkedin } : null,
  ].filter((item) => item !== null);

  return (
    <>
      <Link href="/members" className="mb-3 inline-block text-sm text-navy-400 hover:text-navy-700">
        ← Back to members
      </Link>

      <PageHeader
        title={member.name}
        subtitle={[member.roleTitle, member.company].filter(Boolean).join(" · ") || undefined}
        action={
          canEdit ? (
            <Link
              href={isOwnProfile ? "/profile" : `/admin/members/${member.id}`}
              className="rounded-lg border border-navy-200 bg-white px-3.5 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
            >
              {isOwnProfile ? "Edit my profile" : "Edit as admin"}
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-3">
        <Card className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            {member.baseCountry ? <Tag tone="gold">Based in {member.baseCountry}</Tag> : null}
            {isAdmin(actor) ? <StatusPill status={member.status} /> : null}
          </div>

          {member.markets.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">
                Markets covered
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {member.markets.map((market) => (
                  <Tag key={market}>{market}</Tag>
                ))}
              </div>
            </div>
          ) : null}

          {member.expertise.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">
                Products / services / expertise
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {member.expertise.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </div>
          ) : null}

          <DetailBlock label="What they do" value={member.whatTheyDo} />
          <DetailBlock label="Current focus" value={member.currentFocus} />
          <DetailBlock label="Looking for" value={member.lookingFor} />
          <DetailBlock label="Can help with" value={member.canOffer} />
        </Card>

        {contact.length > 0 ? (
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">Contact</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {contact.map((item) => (
                <li key={item.label} className="flex flex-wrap gap-x-2">
                  <span className="text-navy-400">{item.label}:</span>
                  <a
                    className="break-all text-navy-700 underline decoration-gold-300 underline-offset-2"
                    href={item.href}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {member.requests.length > 0 ? (
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">
              Active requests from this member
            </h3>
            <ul className="mt-2 space-y-2">
              {member.requests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-start gap-2 text-sm">
                  <StatusPill status={request.status} />
                  <span className="flex-1 text-navy-700">{request.request}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/requests"
              className="mt-3 inline-block text-sm text-navy-400 hover:text-navy-700"
            >
              View all active requests →
            </Link>
          </Card>
        ) : null}

        {member.relevantFor.length > 0 ? (
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">
              Could contribute to
            </h3>
            <ul className="mt-2 space-y-2">
              {member.relevantFor.map((request) => (
                <li key={request.id} className="flex flex-wrap items-start gap-2 text-sm">
                  <StatusPill status={request.status} />
                  <span className="flex-1 text-navy-700">{request.request}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <p className="px-1 text-xs text-navy-400">
          Last updated {member.updatedAt.toISOString().slice(0, 10)}
        </p>
      </div>
    </>
  );
}
