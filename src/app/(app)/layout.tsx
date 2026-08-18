import Link from "next/link";
import { requireUser } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { BrandMark } from "@/components/BrandMark";
import { NavLink } from "@/components/NavLink";
import { logoutAction } from "@/actions/auth-actions";

/**
 * Guard for every authenticated page. No directory data is rendered or fetched
 * before this resolves; each page and server action re-checks authorization
 * independently.
 *
 * The masthead sits on the inverse ground, the ink field the design reserves
 * for product chrome, and the page below it is paper.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireUser();
  const admin = isAdmin(actor);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-[var(--pf-inverse-ground)] text-[var(--pf-inverse)]">
        <div className="mx-auto flex w-full max-w-[var(--pt-measure-page)] items-center justify-between gap-3 px-[var(--pt-gutter)] py-3.5">
          <Link href="/members" className="flex items-center gap-3 no-underline">
            <BrandMark size={30} ground="ink" />
            <span className="leading-tight">
              <span className="block font-serif text-[17px] font-medium tracking-[-0.012em] text-[var(--pf-inverse)]">
                Global Trade Network
              </span>
              <span className="block font-mono text-(length:--pt-mono-affordance) tracking-[var(--pt-ls-micro)] text-[var(--pf-inverse-mute)] uppercase">
                Community Directory
              </span>
            </span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer border border-transparent px-2 py-1.5 font-mono text-(length:--pt-mono-affordance) tracking-[var(--pt-ls-micro)] text-[var(--pf-inverse-mute)] uppercase hover:text-[var(--pf-inverse)]"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav className="border-t border-[var(--pf-panel-rule)]">
          <ul className="mx-auto flex w-full max-w-[var(--pt-measure-page)] gap-0 overflow-x-auto px-[var(--pt-gutter)] whitespace-nowrap">
            <NavLink href="/members">Members</NavLink>
            <NavLink href="/requests">Active Requests</NavLink>
            <NavLink href="/ledger">The Ledger</NavLink>
            <NavLink href="/profile">My Profile</NavLink>
            {admin ? <NavLink href="/admin">Admin</NavLink> : null}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[var(--pt-measure-page)] flex-1 px-[var(--pt-gutter)] py-[var(--pt-space-6)]">
        {children}
      </main>

      <footer className="mt-[var(--pt-space-7)] border-t border-[var(--pf-rule)]">
        <p className="mx-auto w-full max-w-[var(--pt-measure-page)] px-[var(--pt-gutter)] py-[var(--pt-space-5)] font-mono text-(length:--pt-mono-caption) tracking-[var(--pt-ls-count)] text-[var(--pf-mute)] uppercase">
          Global Trade Network · private to Community members
        </p>
      </footer>
    </div>
  );
}
