/**
 * Authorization rules for the Community directory.
 *
 * These are pure functions with no I/O so they can be unit tested and reused
 * identically by pages, server actions and any future API surface. Every
 * mutation path must call one of these. UI hiding is presentation only and is
 * never the security boundary.
 */

export type Role = "ADMIN" | "MEMBER";

export interface Actor {
  id: string;
  role: Role;
  isActive: boolean;
  /** The single member profile this account owns. Null for admin-only accounts. */
  memberId: string | null;
}

/** Any authenticated, enabled account may read the directory. */
export function canViewDirectory(actor: Actor | null): boolean {
  return actor !== null && actor.isActive;
}

export function isAdmin(actor: Actor | null): boolean {
  return actor !== null && actor.isActive && actor.role === "ADMIN";
}

/** Admin area, member/account management, and Community-wide content. */
export function canAccessAdmin(actor: Actor | null): boolean {
  return isAdmin(actor);
}

/**
 * Profile editing. Admin may correct any profile; a member may edit only the
 * profile their account is linked to.
 */
export function canEditMember(actor: Actor | null, memberId: string): boolean {
  if (actor === null || !actor.isActive) return false;
  if (actor.role === "ADMIN") return true;
  return actor.memberId !== null && actor.memberId === memberId;
}

/** Creating, deactivating or archiving member records is admin-only. */
export function canManageMembers(actor: Actor | null): boolean {
  return isAdmin(actor);
}

/** Creating logins, disabling logins and changing roles is admin-only. */
export function canManageAccounts(actor: Actor | null): boolean {
  return isAdmin(actor);
}

/**
 * Requests / opportunities are curated by the admin in V1, members may read
 * them but may not publish or modify them.
 */
export function canManageOpportunities(actor: Actor | null): boolean {
  return isAdmin(actor);
}

export function canViewOpportunities(actor: Actor | null): boolean {
  return canViewDirectory(actor);
}

/**
 * Fields a member is allowed to change on their own profile. Admin-controlled
 * fields (status, and the identity of the account) are deliberately excluded so
 * a member cannot reactivate an archived profile by posting a crafted form.
 */
export const MEMBER_EDITABLE_FIELDS = [
  "name",
  "company",
  "roleTitle",
  "baseCountry",
  "markets",
  "whatTheyDo",
  "expertise",
  "currentFocus",
  "lookingFor",
  "canOffer",
  "website",
  "linkedin",
  "email",
  "phone",
] as const;

export const ADMIN_ONLY_MEMBER_FIELDS = ["status"] as const;

export type MemberEditableField = (typeof MEMBER_EDITABLE_FIELDS)[number];

export function isMemberEditableField(field: string): field is MemberEditableField {
  return (MEMBER_EDITABLE_FIELDS as readonly string[]).includes(field);
}

/**
 * Narrows a submitted patch to what the actor is allowed to write.
 * Admins keep admin-only fields; members have them stripped rather than the
 * whole request being rejected, so a stale form never blocks a legitimate edit.
 */
export function permittedMemberPatch<T extends Record<string, unknown>>(
  actor: Actor | null,
  memberId: string,
  patch: T,
): Partial<T> | null {
  if (!canEditMember(actor, memberId)) return null;
  if (isAdmin(actor)) return patch;

  const allowed: Partial<T> = {};
  for (const key of Object.keys(patch)) {
    if (isMemberEditableField(key)) {
      allowed[key as keyof T] = patch[key as keyof T];
    }
  }
  return allowed;
}

export class AuthorizationError extends Error {
  constructor(message = "Not authorised") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function assertAdmin(actor: Actor | null): asserts actor is Actor {
  if (!isAdmin(actor)) throw new AuthorizationError("Admin access required");
}

export function assertCanEditMember(actor: Actor | null, memberId: string): asserts actor is Actor {
  if (!canEditMember(actor, memberId)) {
    throw new AuthorizationError("You may only edit your own profile");
  }
}
