"use client";

type ProgressBarProps = {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  color?: "accent" | "success" | "muted";
  className?: string;
};

const colorMap = {
  accent: "bg-[var(--accent)]",
  success: "bg-[var(--success)]",
  muted: "bg-[var(--muted)]",
};

export default function ProgressBar({
  value,
  label,
  showValue = true,
  color = "accent",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-[var(--muted)]">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2.5 w-full rounded-full bg-[var(--progress-bg)] overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
