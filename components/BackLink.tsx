import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
      <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      {children}
    </Link>
  );
}
