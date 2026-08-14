/**
 * Exports the whole directory to a timestamped JSON file for backup or
 * migration. Password hashes are deliberately excluded.
 *
 *   npm run db:export
 *
 * Output goes to exports/, which is git-ignored because it contains member
 * contact details.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [members, opportunities, users] = await Promise.all([
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    prisma.opportunity.findMany({
      orderBy: { dateAdded: "desc" },
      include: { relevantMembers: { select: { id: true, name: true } } },
    }),
    prisma.user.findMany({
      orderBy: { email: "asc" },
      // No passwordHash: a backup should never carry credential material.
      select: { id: true, email: true, role: true, isActive: true, memberId: true },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: { members: members.length, opportunities: opportunities.length, users: users.length },
    members,
    opportunities,
    users,
  };

  const dir = join(process.cwd(), "exports");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `directory-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Exported ${members.length} members and ${opportunities.length} requests to ${file}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
