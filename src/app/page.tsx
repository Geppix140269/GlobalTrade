import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const actor = await getCurrentUser();
  redirect(actor ? "/members" : "/login");
}
