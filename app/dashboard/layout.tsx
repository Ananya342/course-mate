"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/qa", label: "Q&A" },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, conversations, courses } = useApp();
  const myCourses = courses.filter((c) => user.courses.includes(c.id));
  const recentConvos = conversations
    .slice(0, 5)
    .sort((a, b) => new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime());

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="w-full px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-2xl text-[var(--text)] hover:text-[var(--accent)] transition-colors">
            CourseMate
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
            <NavLink href="/dashboard/profile" label="Your profile" />
          </nav>
        </div>
      </header>

      <div className="flex-1 flex w-full min-w-0">
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Right: Recent chats + courses */}
        <aside className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)]/80 p-6 flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">Recent chats</h3>
            <ul className="space-y-1">
              {recentConvos.length === 0 ? (
                <li className="text-sm text-[var(--muted)]">No conversations yet</li>
              ) : (
                recentConvos.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/chat?group=${c.id}`}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors truncate"
                    >
                      {c.type === "dm" ? "💬" : "👥"} {c.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">Courses enrolled</h3>
            <ul className="space-y-1">
              {myCourses.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/qa?course=${c.id}`}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors"
                  >
                    {c.code}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
        isActive
          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppProvider>
  );
}
