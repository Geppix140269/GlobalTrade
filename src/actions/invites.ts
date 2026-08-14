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
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const code = parsed.data.code ? normaliseCode(parsed.data.code) : generateCode();
  if (code.length < 6) return { ok: false, message: "Use a code of at least 6 characters." };

  const maxUses = parsed.data.maxUses ? Number.parseInt(parsed.data.maxUses, 10) : null;
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
    data: { code, label: parsed.data.label, maxUses, expiresAt },
  });

  revalidatePath("/admin/invites");
  return { ok: true, message: `Invite code ${code} created.` };
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
