"use client";

import type { Match } from "@/lib/types";
import { Card, Button, ProgressBar } from "@/components/ui";
import { MOCK_COURSES } from "@/lib/mockData";

type MatchCardProps = {
  match: Match;
  onStartChat: (match: Match) => void;
  onViewProfile?: (match: Match) => void;
};

export default function MatchCard({ match, onStartChat, onViewProfile }: MatchCardProps) {
  const course = MOCK_COURSES.find((c) => c.id === match.courseId);
  const { user, breakdown } = match;
  return (
    <Card
      hover
      padding="lg"
      className="flex flex-col gap-4 cursor-pointer border-[var(--accent)]/20 hover:border-[var(--accent)]/50 min-w-0"
      onClick={() => onViewProfile?.(match)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text)] truncate">{user.name}</p>
            <p className="text-sm text-[var(--muted)]">{course?.code ?? match.courseId}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-bold text-[var(--accent)]">{breakdown.overall}%</span>
          <p className="text-xs text-[var(--muted)]">match</p>
        </div>
      </div>
      <ProgressBar value={breakdown.overall} showValue={false} label="Overall" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[var(--bg)]/80 py-2 px-2">
          <p className="text-lg font-semibold text-[var(--text)]">{breakdown.availability}%</p>
          <p className="text-xs text-[var(--muted)]">Availability</p>
        </div>
        <div className="rounded-lg bg-[var(--bg)]/80 py-2 px-2">
          <p className="text-lg font-semibold text-[var(--text)]">{breakdown.studyStyle}%</p>
          <p className="text-xs text-[var(--muted)]">Study style</p>
        </div>
        <div className="rounded-lg bg-[var(--bg)]/80 py-2 px-2">
          <p className="text-lg font-semibold text-[var(--text)]">{breakdown.skillLevel}%</p>
          <p className="text-xs text-[var(--muted)]">Skill</p>
        </div>
      </div>
      <div className="pt-1 border-t border-[var(--border)] flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onViewProfile && (
            <Button variant="ghost" size="sm" onClick={() => onViewProfile(match)}>
              Profile
            </Button>
          )}
          <Button size="sm" onClick={() => onStartChat(match)}>
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
