"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import MatchCard from "@/components/MatchCard";
import MatchProfileModal from "@/components/MatchProfileModal";
import { Button } from "@/components/ui";
import { MOCK_COURSES } from "@/lib/mockData";
import type { Match } from "@/lib/types";

export default function MatchesPage() {
  const router = useRouter();
  const { user, matches, createChatGroup, createDM } = useApp();
  const [profileMatch, setProfileMatch] = useState<Match | null>(null);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Your matches</h1>
          <p className="text-[var(--muted)] mt-1">Click a card to view profile, socials & fun fact.</p>
        </div>
        <Link href="/dashboard/request">
          <Button className="gradient-bg border-0 text-white font-bold px-6 py-3">
            + New request
          </Button>
        </Link>
      </div>
      {matches.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted)] mb-4">No matches yet. Add a study request to see compatible partners.</p>
          <Link href="/dashboard/request">
            <Button className="gradient-bg border-0 text-white">Add study request</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onStartChat={handleStartChat}
              onViewProfile={setProfileMatch}
            />
          ))}
        </div>
      )}

      {profileMatch && (
        <MatchProfileModal
          match={profileMatch}
          onClose={() => setProfileMatch(null)}
          onStartChat={handleStartDmFromProfile}
        />
      )}
    </div>
  );
}
