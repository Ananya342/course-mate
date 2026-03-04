"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import MatchCard from "@/components/MatchCard";
import MatchProfileModal from "@/components/MatchProfileModal";
import OnboardingModal from "@/components/OnboardingModal";
import { Card, Button } from "@/components/ui";
import { MOCK_COURSES } from "@/lib/mockData";
import type { Match } from "@/lib/types";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, matches, createChatGroup, createDM } = useApp();
  const recentMatches = matches.slice(0, 3);
  const [profileMatch, setProfileMatch] = useState<Match | null>(null);
  const showOnboarding = searchParams.get("onboarding") === "1";

  const handleStartChat = (match: Match) => {
    const course = MOCK_COURSES.find((c) => c.id === match.courseId);
    const groupId = createChatGroup(
      `${course?.code ?? match.courseId} - Study Group`,
      match.courseId,
      [user.id, match.user.id]
    );
    setProfileMatch(null);
    router.push(`/dashboard/chat?group=${groupId}`);
  };

  const handleStartDmFromProfile = (match: Match) => {
    const dmId = createDM(match.user.id, match.user.name);
    setProfileMatch(null);
    router.push(`/dashboard/chat?group=${dmId}`);
  };

  return (
    <div className="space-y-8">
      {showOnboarding && <OnboardingModal />}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-[var(--muted)] mt-1">Welcome back, {user.name.split(" ")[0]}.</p>
      </div>

      {/* Prominent New request CTA */}
      <section className="rounded-2xl bg-gradient-to-r from-[var(--accent)]/25 via-[var(--pink)]/25 to-[var(--electric)]/25 border-2 border-[var(--accent)]/40 p-6 sm:p-8 shadow-lg shadow-[var(--accent)]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Find a study partner</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Add a request and we’ll match you with compatible students.</p>
          </div>
          <Link href="/dashboard/request" className="flex-shrink-0">
            <Button
              size="lg"
              className="gradient-bg border-0 text-white font-bold px-8 py-4 text-base shadow-lg hover:opacity-95 w-full sm:w-auto"
            >
              + New request
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]">Recent matches</h2>
          {matches.length > 0 && (
            <Link href="/dashboard/matches" className="text-sm font-semibold text-[var(--accent)] hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentMatches.length === 0 ? (
          <Card padding="lg" className="text-center py-10">
            <p className="text-[var(--muted)]">No matches yet.</p>
            <Link href="/dashboard/request" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">Add a study request</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}>
            {recentMatches.map((m) => (
              <MatchCard key={m.id} match={m} onStartChat={handleStartChat} onViewProfile={setProfileMatch} />
            ))}
          </div>
        )}
      </section>

      {profileMatch && (
        <MatchProfileModal match={profileMatch} onClose={() => setProfileMatch(null)} onStartChat={handleStartDmFromProfile} />
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/chat">
          <Card hover padding="lg" className="h-full flex items-center gap-4 border-[var(--electric)]/20 hover:border-[var(--electric)]/50">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--electric)]/30 to-[var(--mint)]/30 flex items-center justify-center text-2xl">
              💬
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)]">Chat</h3>
              <p className="text-sm text-[var(--muted)]">DMs and study groups</p>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/qa">
          <Card hover padding="lg" className="h-full flex items-center gap-4 border-[var(--mint)]/20 hover:border-[var(--mint)]/50">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--mint)]/30 to-[var(--accent)]/30 flex items-center justify-center text-2xl">
              Q&A
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)]">Course Q&A</h3>
              <p className="text-sm text-[var(--muted)]">Piazza-style questions & answers</p>
            </div>
          </Card>
        </Link>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="space-y-8"><div className="h-8 w-48 rounded bg-[var(--surface-hover)]" /><div className="h-32 rounded-2xl bg-[var(--surface-hover)]" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
