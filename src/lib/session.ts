import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Actor, canAccessAdmin } from "@/lib/authz";

/**
 * The authoritative actor for the current request.
 *
 * The JWT carries identity only; role, active state and profile ownership are
 * read from the database each request so admin changes (disable account, change
 * role, unlink profile) apply immediately.
 */
export const getCurrentUser = cache(async (): Promise<Actor | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true, memberId: true },
  });

  if (!user || !user.isActive) return null;
  return user;
});

/** For pages: guarantees an enabled account or sends the visitor to login. */
export async function requireUser(): Promise<Actor> {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");
  return actor;
}

/** For pages: guarantees an admin or sends the visitor back to the directory. */
export async function requireAdmin(): Promise<Actor> {
  const actor = await requireUser();
  if (!canAccessAdmin(actor)) redirect("/members");
  return actor;
}
