"use server";

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
  const reserved = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "InviteCode"
       SET "usedCount" = "usedCount" + 1, "updatedAt" = now()
     WHERE "code" = ${code}
       AND "isActive" = true
       AND ("expiresAt" IS NULL OR "expiresAt" > now())
       AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
     RETURNING "id"
  `;

  const inviteId = reserved[0]?.id;
  if (!inviteId) return { error: INVALID_CODE };

  try {
    await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: { name, company, status: "ACTIVE" },
      });
      await tx.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
          // Self-signup always creates an ordinary member bound to its own
          // profile. Roles are only ever raised by an existing admin.
          role: "MEMBER",
          memberId: member.id,
        },
      });
    });
  } catch {
    // Hand the use back so a failed signup does not burn a seat on the code.
    await prisma.inviteCode.update({
      where: { id: inviteId },
      data: { usedCount: { decrement: 1 } },
    });
    return { error: "We could not create your account. Please try again." };
  }

  // Sign the new member straight in and send them to complete their profile.
  await signIn("credentials", { email, password, redirectTo: "/profile" });
  return { error: null };
}
