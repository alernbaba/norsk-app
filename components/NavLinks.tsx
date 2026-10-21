"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useT } from "./i18n";

type NavId = "overview" | "due" | "settings" | "about";

const LINKS: { id: NavId; href: string; icon: ReactNode }[] = [
  {
    id: "overview",
    href: "/",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    id: "due",
    href: "/due",
    icon: (
      <>
        <path d="M20 12a8 8 0 1 1-2.3-5.6" />
        <path d="M20 4v4.5h-4.5" />
        <path d="M12 8v4l2.5 2" />
      </>
    ),
  },
  {
    id: "settings",
    href: "/settings",
    icon: (
      <>
        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
  },
  {
    id: "about",
    href: "/about",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 11v5M12 8v.01" />
      </>
    ),
  },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/topics") || pathname.startsWith("/practice") : pathname.startsWith(href);
}

/** Pill-shaped navigation in the header, from tablet width up. */
export function HeaderNav() {
  const t = useT();
  const isActive = useIsActive();
  return (
    <div className="hidden items-center gap-1 rounded-full border border-line bg-card/70 p-1 text-sm font-medium sm:flex">
      {LINKS.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          aria-current={isActive(l.href) ? "page" : undefined}
          className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
        >
          {t.nav[l.id]}
        </Link>
      ))}
    </div>
  );
}

/** Tab bar along the bottom edge on phones, within reach of the thumb. */
export function TabBar() {
  const t = useT();
  const isActive = useIsActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.id}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
            className="group flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium text-muted transition-colors aria-[current=page]:text-ink"
          >
            <span className="grid h-7 w-12 place-items-center rounded-full transition-colors group-aria-[current=page]:bg-fjord-soft group-aria-[current=page]:text-fjord">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden
              >
                {l.icon}
              </svg>
            </span>
            {t.nav[l.id]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
