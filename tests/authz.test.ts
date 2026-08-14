import { describe, expect, it } from "vitest";
import {
  type Actor,
  canAccessAdmin,
  canEditMember,
  canManageAccounts,
  canManageMembers,
  canManageOpportunities,
  canViewDirectory,
  canViewOpportunities,
  isAdmin,
  permittedMemberPatch,
} from "@/lib/authz";

const admin: Actor = { id: "u-admin", role: "ADMIN", isActive: true, memberId: null };
const member: Actor = { id: "u-1", role: "MEMBER", isActive: true, memberId: "m-1" };
const otherMember: Actor = { id: "u-2", role: "MEMBER", isActive: true, memberId: "m-2" };
const disabledMember: Actor = { id: "u-3", role: "MEMBER", isActive: false, memberId: "m-3" };
const disabledAdmin: Actor = { id: "u-4", role: "ADMIN", isActive: false, memberId: null };
const unlinkedMember: Actor = { id: "u-5", role: "MEMBER", isActive: true, memberId: null };

describe("directory access", () => {
  it("requires an authenticated account", () => {
    expect(canViewDirectory(null)).toBe(false);
    expect(canViewOpportunities(null)).toBe(false);
  });

  it("allows any enabled account", () => {
    expect(canViewDirectory(member)).toBe(true);
    expect(canViewDirectory(admin)).toBe(true);
  });

  it("denies a disabled account, so admin can revoke access immediately", () => {
    expect(canViewDirectory(disabledMember)).toBe(false);
    expect(canViewDirectory(disabledAdmin)).toBe(false);
  });
});

describe("admin area", () => {
  it("is admin only", () => {
    expect(canAccessAdmin(admin)).toBe(true);
    expect(canAccessAdmin(member)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("is closed to a disabled admin", () => {
    expect(isAdmin(disabledAdmin)).toBe(false);
    expect(canAccessAdmin(disabledAdmin)).toBe(false);
  });

  it("keeps member/account/opportunity management admin only", () => {
    for (const check of [canManageMembers, canManageAccounts, canManageOpportunities]) {
      expect(check(admin)).toBe(true);
      expect(check(member)).toBe(false);
      expect(check(null)).toBe(false);
    }
  });
});

describe("profile ownership", () => {
  it("lets a member edit only their linked profile", () => {
    expect(canEditMember(member, "m-1")).toBe(true);
    expect(canEditMember(member, "m-2")).toBe(false);
    expect(canEditMember(otherMember, "m-1")).toBe(false);
  });

  it("lets an admin correct any profile", () => {
    expect(canEditMember(admin, "m-1")).toBe(true);
    expect(canEditMember(admin, "m-2")).toBe(true);
  });

  it("denies an account with no linked profile", () => {
    expect(canEditMember(unlinkedMember, "m-1")).toBe(false);
    // A null memberId must never match a null-ish id.
    expect(canEditMember(unlinkedMember, "")).toBe(false);
  });

  it("denies a disabled account and an anonymous visitor", () => {
    expect(canEditMember(disabledMember, "m-3")).toBe(false);
    expect(canEditMember(null, "m-1")).toBe(false);
  });
});

describe("permittedMemberPatch", () => {
  it("returns null when the actor may not edit the profile", () => {
    expect(permittedMemberPatch(member, "m-2", { name: "Hacked" })).toBeNull();
    expect(permittedMemberPatch(null, "m-1", { name: "Hacked" })).toBeNull();
  });

  it("strips admin-only fields from a member's own submission", () => {
    const patch = permittedMemberPatch(member, "m-1", {
      name: "New Name",
      company: "New Co",
      status: "ACTIVE",
    });

    expect(patch).toEqual({ name: "New Name", company: "New Co" });
    expect(patch).not.toHaveProperty("status");
  });

  it("ignores unknown fields a crafted form might add", () => {
    const patch = permittedMemberPatch(member, "m-1", {
      name: "New Name",
      id: "m-2",
      createdAt: "1999-01-01",
    });

    expect(patch).toEqual({ name: "New Name" });
  });

  it("keeps every field for an admin, including status", () => {
    const patch = permittedMemberPatch(admin, "m-1", { name: "Corrected", status: "ARCHIVED" });
    expect(patch).toEqual({ name: "Corrected", status: "ARCHIVED" });
  });
});
