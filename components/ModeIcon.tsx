import type { Mode } from "@/lib/modes";

const PATHS: Record<Mode, React.ReactNode> = {
  flashcards: (
    <>
      <rect x="7" y="4" width="13" height="16" rx="2.5" />
      <path d="M4.5 7.5v10A2.5 2.5 0 0 0 7 20" />
      <path d="M11 10h5M11 13.5h3" />
    </>
  ),
  reverse: (
    <>
      <rect x="7" y="4" width="13" height="16" rx="2.5" />
      <path d="M4.5 7.5v10A2.5 2.5 0 0 0 7 20" />
      <path d="M10.5 10h6l-2-2M16.5 14h-6l2 2" />
    </>
  ),
  tiles: (
    <>
      <rect x="3" y="5" width="8" height="6" rx="1.5" />
      <rect x="13" y="5" width="8" height="6" rx="1.5" />
      <rect x="6" y="14" width="12" height="6" rx="1.5" />
    </>
  ),
  write: (
    <>
      <path d="M4 20h16" />
      <path d="M14.5 4.5l3 3L9 16l-4 1 1-4z" />
    </>
  ),
  inflection: (
    <>
      <path d="M4 7h7M4 12h4M4 17h7" />
      <path d="M14 7c3 0 4 2 4 5s-1 5-4 5" />
      <path d="M16 15l-2 2 2 2" />
    </>
  ),
};

export function ModeIcon({ mode, className = "h-6 w-6" }: { mode: Mode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[mode]}
    </svg>
  );
}
