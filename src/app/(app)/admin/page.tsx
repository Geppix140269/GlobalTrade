import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin — Global Trade Network" };

export default async function AdminPage() {
  // Guarded by the admin layout as well; repeated here so this page never
  // renders or queries anything on its own if the layout changes.
  await requireAdmin();

  const [members, activeMembers, accounts, openRequests, totalRequests] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.opportunity.count({ where: { status: "OPEN" } }),
    prisma.opportunity.count(),
  ]);

  const sections = [
    {
      href: "/admin/members",
      title: "Members",
      detail: `${activeMembers} active of ${members} profiles`,
      description: "Add, correct, deactivate and archive member profiles.",
    },
    {
      href: "/admin/accounts",
      title: "Accounts",
      detail: `${accounts} enabled logins`,
      description: "Create logins, disable access, change roles and reset passwords.",
    },
    {
      href: "/admin/requests",
      title: "Active Requests",
      detail: `${openRequests} open of ${totalRequests}`,
      description: "Curate Community requests and keep their status current.",
    },
  ];

  return (
    <>
      <PageHeader title="Admin" subtitle="Manage the directory, accounts and Community requests." />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className="block h-full">
              <Card className="h-full p-4 transition-colors hover:border-gold-300">
                <h2 className="font-semibold text-navy-900">{section.title}</h2>
                <p className="mt-0.5 text-sm font-medium text-gold-600">{section.detail}</p>
                <p className="mt-2 text-sm text-navy-400">{section.description}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
