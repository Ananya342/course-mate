"use client";

import type { ChatGroup } from "@/lib/types";
import { MOCK_COURSES } from "@/lib/mockData";
import Link from "next/link";

type ChatSidebarProps = {
  groups: ChatGroup[];
  activeId: string | null;
};

export default function ChatSidebar({ groups, activeId }: ChatSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="font-semibold text-[var(--foreground)]">Study groups</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="text-sm text-[var(--muted)] p-3">No groups yet. Find a match to start chatting.</p>
        ) : (
          <ul className="space-y-1">
            {groups.map((g) => {
              const course = MOCK_COURSES.find((c) => c.id === g.courseId);
              const isActive = activeId === g.id;
              return (
                <li key={g.id}>
                  <Link
                    href={`/dashboard/chat?group=${g.id}`}
                    className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--accent)]/20 text-[var(--accent)] font-medium"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <p className="font-medium truncate">{g.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{course?.code ?? g.courseId}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
