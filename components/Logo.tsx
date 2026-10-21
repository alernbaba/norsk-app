import { useId } from "react";

/** A small Nordic cross on a rounded tile: the app's mark. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <clipPath id={clip}>
        <rect x="1" y="3" width="30" height="26" rx="7" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x="1" y="3" width="30" height="26" fill="var(--rust)" />
        <path d="M11 3v26M1 16h30" stroke="var(--card)" strokeWidth="7" />
        <path d="M11 3v26M1 16h30" stroke="var(--fjord)" strokeWidth="3.2" />
      </g>
    </svg>
  );
}
