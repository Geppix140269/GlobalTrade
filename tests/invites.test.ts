import { describe, expect, it } from "vitest";
import { checkInvite, generateCode, normaliseCode, type InviteLike } from "@/lib/invites";

const now = new Date("2026-06-01T12:00:00Z");
const base: InviteLike = { isActive: true, expiresAt: null, maxUses: null, usedCount: 0 };

describe("checkInvite", () => {
  it("accepts an active, unlimited, non-expiring code", () => {
    expect(checkInvite(base, now).ok).toBe(true);
  });

  it("rejects a missing code", () => {
    expect(checkInvite(null, now).ok).toBe(false);
  });

  it("rejects a disabled code", () => {
    expect(checkInvite({ ...base, isActive: false }, now).ok).toBe(false);
  });

  it("rejects an expired code but accepts one expiring later", () => {
    expect(checkInvite({ ...base, expiresAt: new Date("2026-05-31T12:00:00Z") }, now).ok).toBe(
      false,
    );
    expect(checkInvite({ ...base, expiresAt: new Date("2026-06-02T12:00:00Z") }, now).ok).toBe(
      true,
    );
  });

  it("treats the exact expiry moment as expired", () => {
    expect(checkInvite({ ...base, expiresAt: new Date(now) }, now).ok).toBe(false);
  });

  it("rejects a code that has reached its usage limit", () => {
    expect(checkInvite({ ...base, maxUses: 5, usedCount: 4 }, now).ok).toBe(true);
    expect(checkInvite({ ...base, maxUses: 5, usedCount: 5 }, now).ok).toBe(false);
    expect(checkInvite({ ...base, maxUses: 5, usedCount: 6 }, now).ok).toBe(false);
  });

  it("gives one identical message for every refusal, so codes cannot be probed", () => {
    const reasons = [
      checkInvite(null, now),
      checkInvite({ ...base, isActive: false }, now),
      checkInvite({ ...base, maxUses: 1, usedCount: 1 }, now),
      checkInvite({ ...base, expiresAt: new Date("2020-01-01") }, now),
    ].map((r) => (r.ok ? "ok" : r.reason));

    expect(new Set(reasons).size).toBe(1);
  });
});

describe("claim codes", () => {
  // A claim code is an ordinary code that also names a profile; the usability
  // rules must not change just because memberId is set.
  const claim: InviteLike = { ...base, maxUses: 1 };

  it("is usable while unused and refused once spent", () => {
    expect(checkInvite({ ...claim, usedCount: 0 }, now).ok).toBe(true);
    expect(checkInvite({ ...claim, usedCount: 1 }, now).ok).toBe(false);
  });

  it("is refused when disabled or expired, like any other code", () => {
    expect(checkInvite({ ...claim, isActive: false }, now).ok).toBe(false);
    expect(checkInvite({ ...claim, expiresAt: new Date("2020-01-01") }, now).ok).toBe(false);
  });
});

describe("normaliseCode", () => {
  it("uppercases and strips whitespace so members can type casually", () => {
    expect(normaliseCode("  gtn-7k4p-qx2m ")).toBe("GTN-7K4P-QX2M");
    expect(normaliseCode("gtn 7k4p qx2m")).toBe("GTN7K4PQX2M");
  });
});

describe("generateCode", () => {
  it("produces the documented shape", () => {
    expect(generateCode(() => 0)).toMatch(/^GTN-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("avoids characters that are easy to misread", () => {
    let i = 0;
    const code = generateCode(() => (i++ % 32) / 32);
    expect(code.slice(4)).not.toMatch(/[IO01]/);
  });
});
