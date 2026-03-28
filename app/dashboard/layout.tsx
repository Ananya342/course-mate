"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveEnrolledCourses } from "@/lib/coursesDisplay";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/qa", label: "Q&A" },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, conversations, courses } = useApp();
  const myCourses = resolveEnrolledCourses(user, courses);
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
        <aside className="hidden lg:flex w-80 xl:w-[22rem] flex-shrink-0 border-l border-[var(--border)] bg-gradient-to-b from-[var(--surface)] via-[var(--surface-hover)]/40 to-[var(--surface)] p-6 flex-col gap-8 overflow-y-auto">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] bg-gradient-to-r from-[var(--accent)] to-[var(--pink)] bg-clip-text text-transparent mb-3">
              Recent chats
            </h3>
            <ul className="space-y-1.5">
              {recentConvos.length === 0 ? (
                <li className="text-sm text-[var(--muted)] leading-relaxed py-2">
                  No conversations yet — start one from Matches or Chat.
                </li>
              ) : (
                recentConvos.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/chat?group=${c.id}`}
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text)] bg-[var(--surface-hover)]/80 hover:bg-gradient-to-r hover:from-[var(--accent)]/15 hover:to-[var(--pink)]/10 hover:text-[var(--accent)] border border-transparent hover:border-[var(--accent)]/20 transition-all truncate"
                    >
                      <span className="mr-1.5 opacity-80">{c.type === "dm" ? "💬" : "👥"}</span>
                      {c.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] bg-gradient-to-r from-[var(--electric)] to-[var(--mint)] bg-clip-text text-transparent mb-3">
              Courses enrolled
            </h3>
            {myCourses.length === 0 ? (
              <p className="text-sm text-[var(--muted)] leading-relaxed py-2">
                No courses yet. Finish onboarding or edit your profile to add courses.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {myCourses.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/qa?course=${c.id}`}
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text)] bg-gradient-to-r from-[var(--mint)]/15 to-[var(--electric)]/10 hover:from-[var(--accent)]/20 hover:to-[var(--pink)]/10 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
                    >
                      <span className="text-[var(--accent)] font-bold">{c.code}</span>
                      <span className="block text-xs font-normal text-[var(--muted)] mt-0.5 truncate">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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

function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authReady, isLoggedIn } = useApp();

  useEffect(() => {
    if (!isSupabaseConfigured() || !authReady || isLoggedIn) return;
    router.replace("/login");
  }, [authReady, isLoggedIn, router]);

  if (isSupabaseConfigured() && !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardAuthGate>
        <DashboardShell>{children}</DashboardShell>
      </DashboardAuthGate>
    </AppProvider>
  );
}
