/**
 * Invite code rules. Pure and testable — the atomic reservation that actually
 * prevents over-use lives in the signup action as a single guarded UPDATE.
 */

export interface InviteLike {
  isActive: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
  usedCount: number;
}

export type InviteCheck = { ok: true } | { ok: false; reason: string };

export function checkInvite(invite: InviteLike | null, now: Date = new Date()): InviteCheck {
  // One message for every failure, so the form cannot be used to probe which
  // codes exist or why a given code was refused.
  const refused = { ok: false, reason: "That invite code is not valid." } as const;

  if (!invite) return refused;
  if (!invite.isActive) return refused;
  if (invite.expiresAt !== null && invite.expiresAt.getTime() <= now.getTime()) return refused;
  if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) return refused;
  return { ok: true };
}

/** Codes are stored and compared uppercase so members can type them casually. */
export function normaliseCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1

/** Generates a readable code such as GTN-7K4P-QX2M. */
export function generateCode(random: () => number = Math.random): string {
  const block = (n: number) =>
    Array.from({ length: n }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join("");
  return `GTN-${block(4)}-${block(4)}`;
}
