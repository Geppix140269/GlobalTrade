import { requireAdmin } from "@/lib/session";

/** Every admin route is gated here, and again inside each server action. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
