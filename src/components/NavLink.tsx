"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A masthead tab. The current one is marked by a gold rule beneath it,
 * gold as structure, which is one of the jobs the design gives it.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-block border-b-2 px-3.5 py-2.5 font-mono text-(length:--pt-mono-affordance) tracking-[var(--pt-ls-micro)] uppercase no-underline ${
          active
            ? "border-[var(--pf-gold-rule)] text-[var(--pf-inverse)]"
            : "border-transparent text-[var(--pf-inverse-mute)] hover:text-[var(--pf-inverse)]"
        }`}
      >
        {children}
      </Link>
    </li>
  );
}
