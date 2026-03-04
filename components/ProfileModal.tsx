"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Card, Button } from "@/components/ui";

type ProfileModalProps = {
  onClose: () => void;
};

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, courses } = useApp();
  const myCourses = courses.filter((c) => user.courses.includes(c.id));
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <Card
        padding="lg"
        className="max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--border)]"
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--pink)] text-white flex items-center justify-center text-2xl font-bold mb-3">
            {initials}
          </div>
          <h3 className="text-xl font-bold text-[var(--text)]">{user.name}</h3>
          <p className="text-sm text-[var(--muted)] truncate w-full">{user.email}</p>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Courses enrolled</p>
            <div className="flex flex-wrap gap-2">
              {myCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/qa?course=${c.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] text-sm font-medium text-[var(--text)] hover:bg-[var(--border)]"
                >
                  {c.code}
                </Link>
              ))}
            </div>
          </div>
          {user.funFact && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Fun fact</p>
              <p className="text-sm text-[var(--text)]">"{user.funFact}"</p>
            </div>
          )}
        </div>
        <Link href="/" className="block">
          <Button variant="secondary" fullWidth>
            Log out
          </Button>
        </Link>
      </Card>
    </div>
  );
}
