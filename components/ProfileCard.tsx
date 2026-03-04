"use client";

import type { User } from "@/lib/types";
import { Card } from "@/components/ui";

type ProfileCardProps = { user: User; compact?: boolean };

export default function ProfileCard({ user, compact }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Card hover padding={compact ? "sm" : "lg"} className="flex items-center gap-4">
      <div
        className="shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--pink)] text-white flex items-center justify-center font-bold text-xl"
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[var(--text)] truncate">{user.name}</p>
        <p className="text-sm text-[var(--muted)] truncate">{user.email}</p>
        {!compact && user.courses.length > 0 && (
          <p className="text-xs text-[var(--muted)] mt-1">
            {user.courses.length} course{user.courses.length !== 1 ? "s" : ""} enrolled
          </p>
        )}
      </div>
    </Card>
  );
}
