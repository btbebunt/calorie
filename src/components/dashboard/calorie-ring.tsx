"use client";

interface CalorieRingProps {
  target: number;
  consumed: number;
  remaining: number;
}

export function CalorieRing({ target, consumed, remaining }: CalorieRingProps) {
  const size = 200;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = circumference * (1 - progress);
  const overTarget = consumed > target;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={
              overTarget
                ? "text-destructive transition-all duration-500"
                : "text-emerald-500 transition-all duration-500"
            }
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tabular-nums">{remaining}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            kcal left
          </span>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-muted/60 px-2 py-2">
          <p className="text-muted-foreground text-xs">Target</p>
          <p className="font-semibold tabular-nums">{target}</p>
        </div>
        <div className="rounded-lg bg-muted/60 px-2 py-2">
          <p className="text-muted-foreground text-xs">Eaten</p>
          <p className="font-semibold tabular-nums">{consumed}</p>
        </div>
        <div className="rounded-lg bg-muted/60 px-2 py-2">
          <p className="text-muted-foreground text-xs">Left</p>
          <p
            className={`font-semibold tabular-nums ${overTarget ? "text-destructive" : "text-emerald-600"}`}
          >
            {remaining}
          </p>
        </div>
      </div>
    </div>
  );
}
