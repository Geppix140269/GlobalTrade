"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { generateCode, normaliseCode } from "@/lib/invites";
import { firstError } from "@/lib/validation";
import type { ActionResult } from "@/actions/profile";

const inviteSchema = z.object({
  label: z.string().trim().max(120).default(""),
  code: z.string().trim().max(64).default(""),
  maxUses: z.string().trim().default(""),
  expiresInDays: z.string().trim().default(""),
  memberId: z.string().trim().default(""),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function createInvite(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const parsed = inviteSchema.safeParse({
    label: String(formData.get("label") ?? ""),
    code: String(formData.get("code") ?? ""),
    maxUses: String(formData.get("maxUses") ?? ""),
    expiresInDays: String(formData.get("expiresInDays") ?? ""),
    memberId: String(formData.get("memberId") ?? ""),
    role: String(formData.get("role") ?? "MEMBER"),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const code = parsed.data.code ? normaliseCode(parsed.data.code) : generateCode();
  if (code.length < 6) return { ok: false, message: "Use a code of at least 6 characters." };

  // A claim code hands one specific profile to one person, so it is single use
  // regardless of what was typed in the form.
  const memberId = parsed.data.memberId || null;
  if (memberId) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, user: { select: { id: true } } },
    });
    if (!member) return { ok: false, message: "That member profile no longer exists." };
    if (member.user) return { ok: false, message: "That profile already has an account." };
  }

  const maxUses = memberId ? 1 : parsed.data.maxUses ? Number.parseInt(parsed.data.maxUses, 10) : null;
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    return { ok: false, message: "Maximum uses must be a whole number of 1 or more." };
  }

  const days = parsed.data.expiresInDays ? Number.parseInt(parsed.data.expiresInDays, 10) : null;
  if (days !== null && (!Number.isFinite(days) || days < 1)) {
    return { ok: false, message: "Expiry must be a whole number of days." };
  }
  const expiresAt = days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  if (await prisma.inviteCode.findUnique({ where: { code }, select: { id: true } })) {
    return { ok: false, message: "That code already exists." };
  }

  await prisma.inviteCode.create({
    data: { code, label: parsed.data.label, maxUses, expiresAt, memberId, role: parsed.data.role },
  });

  revalidatePath("/admin/invites");
  const kind = memberId ? "Claim code" : "Invite code";
  const grants = parsed.data.role === "ADMIN" ? " It grants admin access." : "";
  return { ok: true, message: `${kind} ${code} created.${grants}` };
}

export async function setInviteActive(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return { ok: false, message: "Invalid request." };

  await prisma.inviteCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/invites");
  return { ok: true, message: isActive ? "Code enabled." : "Code disabled." };
}
