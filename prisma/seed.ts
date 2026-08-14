/**
 * Seeds the directory with the founding Community members and the requests they
 * raised. Safe to re-run: members are matched by name, requests by requester +
 * type, so an existing row is updated rather than duplicated.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { members, requests } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const byName = new Map<string, string>();

  for (const member of members) {
    const existing = await prisma.member.findFirst({
      where: { name: member.name },
      select: { id: true },
    });

    const saved = existing
      ? await prisma.member.update({ where: { id: existing.id }, data: member })
      : await prisma.member.create({ data: member });

    byName.set(saved.name, saved.id);
    console.log(`${existing ? "Updated" : "Created"} member: ${saved.name}`);
  }

  for (const request of requests) {
    const data = {
      ...request,
      requesterId: byName.get(request.requesterName) ?? null,
      status: "OPEN" as const,
    };

    const existing = await prisma.opportunity.findFirst({
      where: { requesterName: request.requesterName, type: request.type },
      select: { id: true },
    });

    if (existing) {
      await prisma.opportunity.update({ where: { id: existing.id }, data });
    } else {
      await prisma.opportunity.create({ data });
    }
    console.log(`${existing ? "Updated" : "Created"} request: ${request.type}`);
  }

  console.log("\nSeed complete. Create the first admin with: npm run create:admin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
