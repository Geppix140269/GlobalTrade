"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { accountSchema, firstError, passwordSchema } from "@/lib/validation";
import type { ActionResult } from "@/actions/profile";

const BCRYPT_ROUNDS = 12;

/** Admin: create a login for a member (no public self-registration in V1). */
export async function createAccount(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const parsed = accountSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "MEMBER"),
    memberId: String(formData.get("memberId") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const { email, role, memberId, password } = parsed.data;

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, message: "An account with that email already exists." };
  }
  if (memberId) {
    const taken = await prisma.user.findUnique({ where: { memberId }, select: { id: true } });
    if (taken) return { ok: false, message: "That member profile already has an account." };
  }

  await prisma.user.create({
    data: {
      email,
      role,
      memberId: memberId || null,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      mustChangePassword: true,
    },
  });

  revalidatePath("/admin/accounts");
  return { ok: true, message: `Account created for ${email}. Share the password securely.` };
}

/** Admin: enable or disable an account's access. */
export async function setAccountActive(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const userId = String(formData.get("userId") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!userId) return { ok: false, message: "Invalid request." };

  if (userId === actor?.id && !isActive) {
    return { ok: false, message: "You cannot disable your own account." };
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/admin/accounts");
  return { ok: true, message: isActive ? "Access enabled." : "Access disabled." };
}

/** Admin: change an account's role. */
export async function setAccountRole(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || (role !== "ADMIN" && role !== "MEMBER")) {
    return { ok: false, message: "Invalid request." };
  }
  if (userId === actor?.id && role !== "ADMIN") {
    return { ok: false, message: "You cannot remove your own admin role." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/accounts");
  return { ok: true, message: "Role updated." };
}

/** Admin: set a new password for an account. */
export async function resetAccountPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return { ok: false, message: "Admin access required." };

  const userId = String(formData.get("userId") ?? "");
  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!userId || !parsed.success) {
    return { ok: false, message: parsed.success ? "Invalid request." : firstError(parsed.error) };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(parsed.data, BCRYPT_ROUNDS), mustChangePassword: true },
  });
  revalidatePath("/admin/accounts");
  return { ok: true, message: "Password reset. Share it securely." };
}

/** Any signed-in user: change their own password. */
export async function changeMyPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!actor) return { ok: false, message: "Your session has expired. Please sign in again." };

  const current = String(formData.get("currentPassword") ?? "");
  const parsed = passwordSchema.safeParse(String(formData.get("newPassword") ?? ""));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  if (String(formData.get("confirmPassword") ?? "") !== parsed.data) {
    return { ok: false, message: "The new passwords do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { ok: false, message: "Your current password is not correct." };
  }

  await prisma.user.update({
    where: { id: actor.id },
    data: {
      passwordHash: await bcrypt.hash(parsed.data, BCRYPT_ROUNDS),
      mustChangePassword: false,
    },
  });
  return { ok: true, message: "Password changed." };
}
