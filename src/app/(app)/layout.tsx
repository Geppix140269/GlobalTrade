import Link from "next/link";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { logoutAction } from "@/actions/auth-actions";

/**
 * Guard for every authenticated page. No directory data is rendered or fetched
 * before this resolves; each page and server action re-checks authorization
 * independently.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireUser();
  const admin = isAdmin(actor);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/members" className="flex items-center gap-2.5 text-navy-100">
            <Logo size={28} />
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-white">Global Trade Network</span>
              <span className="block text-[11px] text-navy-200">Community Directory</span>
            </span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg px-2.5 py-1.5 text-sm text-navy-200 hover:bg-navy-800 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav className="mx-auto max-w-5xl overflow-x-auto px-2 pb-1">
          <ul className="flex gap-1 text-sm whitespace-nowrap">
            <NavLink href="/members">Members</NavLink>
            <NavLink href="/requests">Active Requests</NavLink>
            <NavLink href="/profile">My Profile</NavLink>
            {admin ? <NavLink href="/admin">Admin</NavLink> : null}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:py-7">{children}</main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-navy-400">
        Global Trade Network — Community Directory. Private to Community members.
      </footer>
    </div>
  );
}
