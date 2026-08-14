"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      <Link
        href={href}
        className={`inline-block rounded-t-lg px-3 py-2 ${
          active
            ? "border-b-2 border-gold-500 font-medium text-white"
            : "border-b-2 border-transparent text-navy-200 hover:text-white"
        }`}
      >
        {children}
      </Link>
    </li>
  );
}
