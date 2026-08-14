/**
 * Integration tests for the server-side authorization boundary.
 *
 * These call the real server actions against a real database, so they prove the
 * rules hold where it matters rather than in the UI. They are skipped unless
 * TEST_DATABASE_URL points at a throwaway Postgres:
 *
 *   TEST_DATABASE_URL=postgresql://... npx prisma db push
 *   TEST_DATABASE_URL=postgresql://... npm test
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Actor } from "@/lib/authz";

const TEST_DB = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DB ? describe : describe.skip;
if (TEST_DB) process.env.DATABASE_URL = TEST_DB;

// revalidatePath needs a request context that does not exist in a unit test.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// The actor is what we are varying; everything else runs for real.
const currentUser = vi.hoisted(() => ({ value: null as Actor | null }));
vi.mock("@/lib/session", () => ({
  getCurrentUser: async () => currentUser.value,
  requireUser: async () => currentUser.value,
  requireAdmin: async () => currentUser.value,
}));

const { prisma } = await import("@/lib/prisma");
const { updateMyProfile, updateMemberAsAdmin, setMemberStatus, createMember } = await import(
  "@/actions/profile"
);
const { createOpportunity, setOpportunityStatus } = await import("@/actions/opportunities");
const { createAccount, setAccountActive } = await import("@/actions/accounts");

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) fd.append(key, value);
  return fd;
}

describeDb("server action authorization", () => {
  let alice = "";
  let bob = "";

  beforeAll(async () => {
    await prisma.opportunity.deleteMany({ where: { requesterName: { startsWith: "ZZTest" } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: "@zztest.invalid" } } });
    await prisma.member.deleteMany({ where: { name: { startsWith: "ZZTest" } } });

    alice = (await prisma.member.create({ data: { name: "ZZTest Alice", company: "Alice Co" } })).id;
    bob = (await prisma.member.create({ data: { name: "ZZTest Bob", company: "Bob Co" } })).id;
  });

  afterAll(async () => {
    await prisma.opportunity.deleteMany({ where: { requesterName: { startsWith: "ZZTest" } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: "@zztest.invalid" } } });
    await prisma.member.deleteMany({ where: { name: { startsWith: "ZZTest" } } });
    await prisma.$disconnect();
  });

  const asAlice: Actor = { id: "u-alice", role: "MEMBER", isActive: true, memberId: "" };
  const asAdmin: Actor = { id: "u-admin", role: "ADMIN", isActive: true, memberId: null };

  beforeEach(() => {
    currentUser.value = { ...asAlice, memberId: alice };
  });

  it("lets a member update their own profile", async () => {
    const result = await updateMyProfile(null, form({ name: "ZZTest Alice", company: "Updated Co" }));

    expect(result.ok).toBe(true);
    const saved = await prisma.member.findUniqueOrThrow({ where: { id: alice } });
    expect(saved.company).toBe("Updated Co");
  });

  it("ignores a memberId smuggled into the form and never touches another profile", async () => {
    const before = await prisma.member.findUniqueOrThrow({ where: { id: bob } });

    const result = await updateMyProfile(
      null,
      // A crafted form pointing at Bob's profile.
      form({ memberId: bob, name: "ZZTest Alice", company: "Hijacked" }),
    );

    expect(result.ok).toBe(true);
    const bobAfter = await prisma.member.findUniqueOrThrow({ where: { id: bob } });
    expect(bobAfter.company).toBe(before.company);
    expect(bobAfter.name).toBe("ZZTest Bob");

    // The write landed on Alice's own profile instead.
    const aliceAfter = await prisma.member.findUniqueOrThrow({ where: { id: alice } });
    expect(aliceAfter.company).toBe("Hijacked");
  });

  it("does not let a member change their own directory status", async () => {
    await prisma.member.update({ where: { id: alice }, data: { status: "ACTIVE" } });

    await updateMyProfile(null, form({ name: "ZZTest Alice", status: "ARCHIVED" }));

    const saved = await prisma.member.findUniqueOrThrow({ where: { id: alice } });
    expect(saved.status).toBe("ACTIVE");
  });

  it("refuses every admin action for a member", async () => {
    const denied = [
      await updateMemberAsAdmin(null, form({ memberId: bob, name: "Hijacked" })),
      await setMemberStatus(null, form({ memberId: bob, status: "ARCHIVED" })),
      await createMember(null, form({ name: "ZZTest Ghost" })),
      await createOpportunity(null, form({ requesterName: "ZZTest Alice", request: "Let me in" })),
      await createAccount(
        null,
        form({ email: "sneak@zztest.invalid", role: "ADMIN", password: "long-enough-pw" }),
      ),
      await setAccountActive(null, form({ userId: "u-admin", isActive: "false" })),
    ];

    for (const result of denied) {
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/admin access required/i);
    }

    // Nothing was created or changed.
    expect(await prisma.member.findFirst({ where: { name: "ZZTest Ghost" } })).toBeNull();
    expect(await prisma.user.findUnique({ where: { email: "sneak@zztest.invalid" } })).toBeNull();
    expect((await prisma.member.findUniqueOrThrow({ where: { id: bob } })).name).toBe("ZZTest Bob");
  });

  it("refuses a member whose account has been disabled", async () => {
    currentUser.value = { ...asAlice, memberId: alice, isActive: false };

    const result = await updateMyProfile(null, form({ name: "ZZTest Alice", company: "Disabled" }));

    expect(result.ok).toBe(false);
    const saved = await prisma.member.findUniqueOrThrow({ where: { id: alice } });
    expect(saved.company).not.toBe("Disabled");
  });

  it("refuses an anonymous visitor", async () => {
    currentUser.value = null;

    expect((await updateMyProfile(null, form({ name: "X" }))).ok).toBe(false);
    expect((await updateMemberAsAdmin(null, form({ memberId: bob, name: "X" }))).ok).toBe(false);
    expect((await createOpportunity(null, form({ requesterName: "X", request: "X" }))).ok).toBe(
      false,
    );
  });

  it("lets an admin correct any profile and manage requests", async () => {
    currentUser.value = asAdmin;

    const edit = await updateMemberAsAdmin(
      null,
      form({ memberId: bob, name: "ZZTest Bob", company: "Corrected By Admin", status: "INACTIVE" }),
    );
    expect(edit.ok).toBe(true);

    const saved = await prisma.member.findUniqueOrThrow({ where: { id: bob } });
    expect(saved.company).toBe("Corrected By Admin");
    expect(saved.status).toBe("INACTIVE");

    const created = await createOpportunity(
      null,
      form({ requesterName: "ZZTest Alice", request: "ZZTest opportunity", type: "ZZTest" }),
    );
    expect(created.ok).toBe(true);

    const opportunity = await prisma.opportunity.findFirstOrThrow({
      where: { request: "ZZTest opportunity" },
    });
    expect((await setOpportunityStatus(null, form({ id: opportunity.id, status: "MATCHED" }))).ok).toBe(
      true,
    );
    expect(
      (await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunity.id } })).status,
    ).toBe("MATCHED");
  });

  it("rejects invalid input before it reaches the database", async () => {
    currentUser.value = { ...asAlice, memberId: alice };

    const blank = await updateMyProfile(null, form({ name: "   " }));
    expect(blank.ok).toBe(false);

    const badUrl = await updateMyProfile(null, form({ name: "ZZTest Alice", website: "not-a-url" }));
    expect(badUrl.ok).toBe(false);
  });
});
