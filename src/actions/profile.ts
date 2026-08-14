"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { assertCanEditMember, isAdmin, permittedMemberPatch } from "@/lib/authz";
import {
  adminMemberSchema,
  firstError,
  memberProfileSchema,
  memberStatusSchema,
  readProfileForm,
} from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * The single write path for member profiles.
 *
 * Every profile change — member self-service or admin correction — goes through
 * here, so a future "pending review" workflow only needs to be added in one
 * place: write the patch to a revisions table instead of the member row when the
 * actor is not an admin, and have the admin apply it later.
 */
async function applyMemberProfileUpdate(
  memberId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await prisma.member.update({ where: { id: memberId }, data: patch });
}

/** Member self-service. The member may only ever touch their linked profile. */
export async function updateMyProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!actor) return { ok: false, message: "Your session has expired. Please sign in again." };
  if (!actor.memberId) {
    return { ok: false, message: "This account is not linked to a member profile." };
  }

  const parsed = memberProfileSchema.safeParse(readProfileForm(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  // Ownership is checked against the actor's own linked profile id, never
  // against an id supplied by the browser.
  const memberId = actor.memberId;
  try {
    assertCanEditMember(actor, memberId);
  } catch {
    return { ok: false, message: "You may only edit your own profile." };
  }

  const patch = permittedMemberPatch(actor, memberId, parsed.data);
  if (!patch) return { ok: false, message: "You may only edit your own profile." };

  await applyMemberProfileUpdate(memberId, patch);
  revalidatePath("/profile");
  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  return { ok: true, message: "Profile saved." };
}

/** Admin correction of any profile, including status. */
export async function updateMemberAsAdmin(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return { ok: false, message: "Missing member." };

  const parsed = adminMemberSchema.safeParse({
    ...readProfileForm(formData),
    status: String(formData.get("status") ?? "ACTIVE"),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const patch = permittedMemberPatch(actor, memberId, parsed.data);
  if (!patch) return { ok: false, message: "Not authorised." };

  await applyMemberProfileUpdate(memberId, patch);
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  return { ok: true, message: "Member saved." };
}

/** Admin: create a new member profile. */
export async function createMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const parsed = adminMemberSchema.safeParse({
    ...readProfileForm(formData),
    status: String(formData.get("status") ?? "ACTIVE"),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const created = await prisma.member.create({ data: parsed.data });
  revalidatePath("/admin/members");
  revalidatePath("/members");
  return { ok: true, message: `${created.name} added to the directory.` };
}

/** Admin: change a member's status (deactivate / archive / reactivate). */
export async function setMemberStatus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const memberId = String(formData.get("memberId") ?? "");
  const parsed = memberStatusSchema.safeParse(String(formData.get("status") ?? ""));
  if (!memberId || !parsed.success) return { ok: false, message: "Invalid request." };

  await prisma.member.update({ where: { id: memberId }, data: { status: parsed.data } });
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  return { ok: true, message: "Status updated." };
}
