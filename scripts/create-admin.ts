/**
 * Creates (or re-points) the first admin account.
 *
 * Credentials come from the environment so nothing sensitive is ever typed into
 * a committed file or captured in shell history via an argument:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run create:admin
 *
 * Re-running with an existing email resets that account's password and ensures
 * it is an enabled admin.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD, e.g.\n" +
        "  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' npm run create:admin",
    );
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", isActive: true, mustChangePassword: false },
    create: { email, passwordHash, role: "ADMIN", isActive: true },
  });

  // Never print the password itself.
  console.log(`Admin ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
