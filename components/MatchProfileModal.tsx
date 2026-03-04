"use client";

import type { Match } from "@/lib/types";
import { Card, Button } from "@/components/ui";
import { MOCK_COURSES } from "@/lib/mockData";

type MatchProfileModalProps = {
  match: Match | null;
  onClose: () => void;
  onStartChat: (match: Match) => void;
};

export default function MatchProfileModal({ match, onClose, onStartChat }: MatchProfileModalProps) {
  if (!match) return null;
  const { user, courseId, breakdown } = match;
  const course = MOCK_COURSES.find((c) => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <Card
        padding="lg"
        className="max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--accent)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--pink)] flex items-center justify-center text-3xl font-bold text-white mb-3">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-[var(--text)]">{user.name}</h3>
          <p className="text-sm text-[var(--muted)]">{course?.code ?? courseId}</p>
          <div className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)]/20">
            <span className="text-2xl font-bold text-[var(--accent)]">{breakdown.overall}%</span>
            <span className="text-sm text-[var(--muted)] ml-1">match</span>
          </div>
        </div>

        {user.funFact && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Fun fact</p>
            <p className="text-sm text-[var(--text)]">"{user.funFact}"</p>
          </div>
        )}

        {user.socials && (user.socials.instagram || user.socials.twitter || user.socials.linkedin || user.socials.discord) && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Socials</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {user.socials.instagram && (
                <a
                  href={`https://instagram.com/${user.socials.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  Instagram
                </a>
              )}
              {user.socials.twitter && (
                <a
                  href={`https://twitter.com/${user.socials.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  Twitter
                </a>
              )}
              {user.socials.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {user.socials.discord && (
                <span className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm text-[var(--muted)]">
                  Discord: {user.socials.discord}
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--muted)] mb-2">Contact</p>
        <p className="text-sm text-[var(--text)] mb-6 truncate">{user.email}</p>

        <Button fullWidth size="lg" onClick={() => onStartChat(match)}>
          Message
        </Button>
      </Card>
    </div>
  );
}
