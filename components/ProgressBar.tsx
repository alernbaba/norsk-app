type Props = { value: number; max: number; label?: string };

export function ProgressBar({ value, max, label }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
