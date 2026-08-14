/**
 * One-shot remote setup over Neon's HTTPS driver.
 *
 * Useful when only port 443 is reachable (locked-down networks, CI sandboxes),
 * where the normal `prisma db push` / `db:seed` path cannot open a Postgres
 * connection on 5432. Applies the schema, loads the seed data and creates the
 * first admin, all idempotently.
 *
 *   DIRECT_URL='postgres://…' ADMIN_EMAIL=… ADMIN_PASSWORD=… \
 *     npx tsx scripts/setup-neon.ts [path/to/schema.sql]
 *
 * Generate the schema file first with:
 *   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { ProxyAgent, setGlobalDispatcher } from "undici";
import bcrypt from "bcryptjs";
import { members, requests } from "../prisma/seed-data";

const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
if (proxy) setGlobalDispatcher(new ProxyAgent(proxy));

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Set DIRECT_URL (or DATABASE_URL) to the Neon connection string.");
  process.exit(1);
}

const sql = neon(url);
const schemaFile = process.argv[2];

async function applySchema(file: string) {
  const statements = readFileSync(file, "utf8")
    .split(/;\s*\n/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Applied ${statements.length} schema statements.`);
}

async function seed() {
  const byName = new Map<string, string>();

  for (const member of members) {
    const existing = await sql`SELECT id FROM "Member" WHERE name = ${member.name} LIMIT 1`;
    const id = existing[0]?.id ?? randomUUID();

    await sql.query(
      `INSERT INTO "Member" (id, name, company, "roleTitle", "baseCountry", markets,
         "whatTheyDo", expertise, "currentFocus", "lookingFor", "canOffer",
         website, linkedin, email, phone, status, "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::"MemberStatus", now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, company = EXCLUDED.company, "roleTitle" = EXCLUDED."roleTitle",
         "baseCountry" = EXCLUDED."baseCountry", markets = EXCLUDED.markets,
         "whatTheyDo" = EXCLUDED."whatTheyDo", expertise = EXCLUDED.expertise,
         "currentFocus" = EXCLUDED."currentFocus", "lookingFor" = EXCLUDED."lookingFor",
         "canOffer" = EXCLUDED."canOffer", website = EXCLUDED.website,
         linkedin = EXCLUDED.linkedin, status = EXCLUDED.status, "updatedAt" = now()`,
      [
        id,
        member.name,
        member.company ?? "",
        member.roleTitle ?? "",
        member.baseCountry ?? "",
        (member.markets as string[] | undefined) ?? [],
        member.whatTheyDo ?? "",
        (member.expertise as string[] | undefined) ?? [],
        member.currentFocus ?? "",
        member.lookingFor ?? "",
        member.canOffer ?? "",
        member.website ?? "",
        member.linkedin ?? "",
        member.email ?? "",
        member.phone ?? "",
        member.status ?? "ACTIVE",
      ],
    );

    byName.set(member.name, id);
    console.log(`${existing[0] ? "Updated" : "Created"} member: ${member.name}`);
  }

  for (const request of requests) {
    const existing = await sql`
      SELECT id FROM "Opportunity"
      WHERE "requesterName" = ${request.requesterName} AND type = ${request.type} LIMIT 1`;
    const id = existing[0]?.id ?? randomUUID();

    await sql.query(
      `INSERT INTO "Opportunity" (id, "requesterName", "requesterCompany", "requesterId",
         type, market, request, "supportNeeded", notes, status, "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'','OPEN'::"OpportunityStatus", now())
       ON CONFLICT (id) DO UPDATE SET
         "requesterCompany" = EXCLUDED."requesterCompany",
         "requesterId" = EXCLUDED."requesterId", market = EXCLUDED.market,
         request = EXCLUDED.request, "supportNeeded" = EXCLUDED."supportNeeded",
         "updatedAt" = now()`,
      [
        id,
        request.requesterName,
        request.requesterCompany,
        byName.get(request.requesterName) ?? null,
        request.type,
        request.market,
        request.request,
        request.supportNeeded,
      ],
    );
    console.log(`${existing[0] ? "Updated" : "Created"} request: ${request.type}`);
  }
}

async function createAdmin(email: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  await sql.query(
    `INSERT INTO "User" (id, email, "passwordHash", role, "isActive", "updatedAt")
     VALUES ($1,$2,$3,'ADMIN'::"Role", true, now())
     ON CONFLICT (email) DO UPDATE SET
       "passwordHash" = EXCLUDED."passwordHash", role = 'ADMIN'::"Role",
       "isActive" = true, "mustChangePassword" = false, "updatedAt" = now()`,
    [randomUUID(), email.trim().toLowerCase(), hash],
  );
  // Never print the password.
  console.log(`Admin ready: ${email}`);
}

async function main() {
  if (schemaFile) await applySchema(schemaFile);
  await seed();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
    await createAdmin(email, password);
  }

  const memberRows = await sql`SELECT count(*)::int AS count FROM "Member"`;
  const requestRows = await sql`SELECT count(*)::int AS count FROM "Opportunity"`;
  console.log(`\nDone: ${memberRows[0]?.count} members, ${requestRows[0]?.count} requests.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
