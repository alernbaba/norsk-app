type Props = { value: number; max: number; label?: string };

export function ProgressBar({ value, max, label }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-sunk"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${pct === 100 ? "bg-moss" : "bg-fjord"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
