"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { normaliseCode } from "@/lib/invites";
import { firstError, passwordSchema } from "@/lib/validation";

const BCRYPT_ROUNDS = 12;

export interface SignupState {
  error: string | null;
}

const signupSchema = z
  .object({
    inviteCode: z.string().trim().min(1, "An invite code is required.").max(64),
    name: z.string().trim().min(1, "Your name is required.").max(120),
    company: z.string().trim().max(160).default(""),
    email: z.string().trim().toLowerCase().email("A valid email address is required.").max(200),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export async function signUpAction(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    inviteCode: String(formData.get("inviteCode") ?? ""),
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { name, company, email, password } = parsed.data;
  const code = normaliseCode(parsed.data.inviteCode);
  const INVALID_CODE = "That invite code is not valid.";

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "An account already exists for that email address. Try signing in." };
  }

  // Reserve a use atomically: the WHERE clause re-checks active, expiry and the
  // usage limit in the same statement that increments the counter, so two people
  // submitting the last use of a code cannot both succeed.
  const reserved = await prisma.$queryRaw<
    { id: string; memberId: string | null; role: "ADMIN" | "MEMBER" }[]
  >`
    UPDATE "InviteCode"
       SET "usedCount" = "usedCount" + 1, "updatedAt" = now()
     WHERE "code" = ${code}
       AND "isActive" = true
       AND ("expiresAt" IS NULL OR "expiresAt" > now())
       AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
     RETURNING "id", "memberId", "role"
  `;

  const invite = reserved[0];
  if (!invite) return { error: INVALID_CODE };
  const inviteId = invite.id;

  /** Give the reserved use back so a failed signup does not burn a seat. */
  const releaseUse = () =>
    prisma.inviteCode.update({ where: { id: inviteId }, data: { usedCount: { decrement: 1 } } });

  // A claim code adopts an existing profile rather than creating a new one, so
  // the person described by a seeded profile becomes its owner and can edit it.
  if (invite.memberId) {
    try {
      await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
          // The role is whatever the admin baked into this code.
          role: invite.role,
          // User.memberId is unique, so a second claim of the same profile is
          // rejected by the database rather than by a check that could race.
          memberId: invite.memberId,
        },
      });
    } catch {
      await releaseUse();
      return { error: "That profile has already been claimed. Please contact the administrator." };
    }

    await signIn("credentials", { email, password, redirectTo: "/profile" });
    return { error: null };
  }

  try {
    // The member id is generated here rather than by the database so both rows
    // can go in the batch form of $transaction. The interactive form needs a
    // session pinned to one connection, which a transaction-mode pooler
    // (Neon's and Supabase's are both PgBouncer) does not provide — it works
    // against a direct connection and fails in production.
    const memberId = randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.member.create({ data: { id: memberId, name, company, status: "ACTIVE" } }),
      prisma.user.create({
        data: {
          email,
          passwordHash,
          // The role comes from the code, which only an admin can create — a
          // member can never choose their own.
          role: invite.role,
          memberId,
        },
      }),
    ]);
  } catch {
    await releaseUse();
    return { error: "We could not create your account. Please try again." };
  }

  // Sign the new member straight in and send them to complete their profile.
  await signIn("credentials", { email, password, redirectTo: "/profile" });
  return { error: null };
}
