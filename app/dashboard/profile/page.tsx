"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Card, Button } from "@/components/ui";

export default function ProfilePage() {
  const { user, courses } = useApp();
  const myCourses = courses.filter((c) => user.courses.includes(c.id));
  const initials = (user.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Your profile</h1>
        <p className="text-[var(--muted)] mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile details */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Profile details</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--pink)] text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-[var(--text)]">{user.name}</p>
            <p className="text-sm text-[var(--muted)] truncate">{user.email}</p>
          </div>
        </div>
        {user.funFact && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Fun fact</p>
            <p className="text-sm text-[var(--text)]">"{user.funFact}"</p>
          </div>
        )}
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
      </Card>

      {/* Settings */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div>
              <p className="font-medium text-[var(--text)]">Email notifications</p>
              <p className="text-sm text-[var(--muted)]">Get notified about new matches and messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div>
              <p className="font-medium text-[var(--text)]">Study reminders</p>
              <p className="text-sm text-[var(--muted)]">Daily reminder to log study sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div>
              <p className="font-medium text-[var(--text)]">Profile visibility</p>
              <p className="text-sm text-[var(--muted)]">Allow others to find you in campus search</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-[var(--text)]">Anonymous Q&A</p>
              <p className="text-sm text-[var(--muted)]">Allow posting anonymously in course Q&A</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Log out */}
      <Card padding="lg">
        <Link href="/">
          <Button variant="secondary" fullWidth>
            Log out
          </Button>
        </Link>
      </Card>
    </div>
  );
}
