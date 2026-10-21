type Props = { value: number; goal: number; size?: number; label: string };

/** A ring that fills up towards the daily goal, with the count in the middle. */
export function GoalRing({ value, goal, size = 88, label }: Props) {
  const stroke = size / 11;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = goal > 0 ? Math.min(1, value / goal) : 0;
  const met = value >= goal;
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-valuenow={Math.min(value, goal)}
      aria-label={label}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sunk)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={met ? "var(--moss)" : "var(--fjord)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          opacity={fraction === 0 ? 0 : 1}
        />
      </svg>
      <p className="font-display leading-none font-medium tabular-nums" aria-hidden style={{ fontSize: size / 3.4 }}>
        {met ? <span className="text-moss">✓</span> : value}
        {!met && <span className="block text-center font-sans text-[0.65rem] font-normal text-muted">/{goal}</span>}
      </p>
    </div>
  );
}
