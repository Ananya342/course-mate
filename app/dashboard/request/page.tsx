"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button, Card, Select } from "@/components/ui";
import AvailabilityPicker from "@/components/AvailabilityPicker";
import type { SkillLevel, StudyStyle, TimeBlock } from "@/lib/types";

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const STYLE_OPTIONS: { value: StudyStyle; label: string }[] = [
  { value: "discussion", label: "Discussion" },
  { value: "problem_solving", label: "Problem-solving" },
  { value: "teaching", label: "Teaching" },
  { value: "solo_review", label: "Solo review" },
];

export default function AddStudyRequestPage() {
  const router = useRouter();
  const { user, courses, addStudyRequest } = useApp();
  const [courseId, setCourseId] = useState(user.courses[0] ?? courses[0]?.id ?? "");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [studyStyle, setStudyStyle] = useState<StudyStyle>("problem_solving");
  const [availability, setAvailability] = useState<TimeBlock[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const courseOptions = courses
    .filter((c) => user.courses.includes(c.id))
    .map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    addStudyRequest({
      userId: user.id,
      courseId,
      skillLevel,
      studyStyle,
      availability: availability.length ? availability : user.availability,
    });
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard/matches"), 1200);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 text-[var(--success)] flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Request saved</h2>
        <p className="text-[var(--muted)] mt-1">Redirecting to your matches…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Add study request</h1>
        <p className="text-[var(--muted)] mt-1">We’ll use this to find compatible study partners.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card padding="lg" className="space-y-5">
          <Select
            label="Course"
            options={courseOptions}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          />
          <Select
            label="Skill level"
            options={SKILL_OPTIONS}
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
          />
          <Select
            label="Study style"
            options={STYLE_OPTIONS}
            value={studyStyle}
            onChange={(e) => setStudyStyle(e.target.value as StudyStyle)}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Weekly availability
            </label>
            <AvailabilityPicker value={availability} onChange={setAvailability} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth>
              Find matches
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
