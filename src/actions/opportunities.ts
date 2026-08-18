"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canManageOpportunities } from "@/lib/authz";
import { firstError, opportunitySchema, opportunityStatusSchema } from "@/lib/validation";
import type { ActionResult } from "@/actions/profile";

function readOpportunityForm(formData: FormData) {
  return {
    requesterId: String(formData.get("requesterId") ?? ""),
    requesterName: String(formData.get("requesterName") ?? ""),
    requesterCompany: String(formData.get("requesterCompany") ?? ""),
    type: String(formData.get("type") ?? ""),
    market: String(formData.get("market") ?? ""),
    request: String(formData.get("request") ?? ""),
    supportNeeded: String(formData.get("supportNeeded") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "OPEN"),
    relevantMemberIds: formData.getAll("relevantMemberIds").map(String).filter(Boolean),
  };
}

/** Admin only, members may read requests but never publish or edit them in V1. */
export async function createOpportunity(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!canManageOpportunities(actor)) return { ok: false, message: "Admin access required." };

  const parsed = opportunitySchema.safeParse(readOpportunityForm(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const { requesterId, relevantMemberIds, ...rest } = parsed.data;
  await prisma.opportunity.create({
    data: {
      ...rest,
      requesterId: requesterId || null,
      relevantMembers: { connect: relevantMemberIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/requests");
  revalidatePath("/admin/requests");
  return { ok: true, message: "Request added." };
}

export async function updateOpportunity(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!canManageOpportunities(actor)) return { ok: false, message: "Admin access required." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing request." };

  const parsed = opportunitySchema.safeParse(readOpportunityForm(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const { requesterId, relevantMemberIds, ...rest } = parsed.data;
  await prisma.opportunity.update({
    where: { id },
    data: {
      ...rest,
      requesterId: requesterId || null,
      relevantMembers: { set: relevantMemberIds.map((mid) => ({ id: mid })) },
    },
  });

  revalidatePath("/requests");
  revalidatePath("/admin/requests");
  return { ok: true, message: "Request saved." };
}

/** Quick status change from the admin list (Open -> In Progress -> Matched -> Closed). */
export async function setOpportunityStatus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!canManageOpportunities(actor)) return { ok: false, message: "Admin access required." };

  const id = String(formData.get("id") ?? "");
  const parsed = opportunityStatusSchema.safeParse(String(formData.get("status") ?? ""));
  if (!id || !parsed.success) return { ok: false, message: "Invalid request." };

  await prisma.opportunity.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/requests");
  revalidatePath("/admin/requests");
  return { ok: true, message: "Status updated." };
}
