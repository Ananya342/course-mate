"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, type OnboardingData } from "@/context/AppContext";
import { Button, Card, Input } from "@/components/ui";
import type { StudyStyle, SkillLevel, StudyLocation, StudyGoal, StudyTimePreference } from "@/lib/types";

const TOTAL_STEPS = 6;

const STUDY_STYLE_OPTIONS: { value: StudyStyle; label: string }[] = [
  { value: "discussion", label: "Discussion-based (talk through concepts)" },
  { value: "problem_solving", label: "Problem-solving focused" },
  { value: "teaching", label: "Teaching-based (explain to others)" },
  { value: "quiet_review_together", label: "Quiet review together" },
  { value: "structured", label: "Structured / agenda-driven" },
  { value: "casual", label: "Casual / flexible" },
];

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner (I'm struggling / just starting)" },
  { value: "intermediate", label: "Intermediate (I understand most concepts)" },
  { value: "advanced", label: "Advanced (I'm confident and can help others)" },
];

const LOCATION_OPTIONS: { value: StudyLocation; label: string }[] = [
  { value: "library", label: "Library" },
  { value: "quiet_space", label: "Quiet space" },
  { value: "cafe", label: "Café" },
  { value: "dorm", label: "Dorm" },
  { value: "online", label: "Online (Zoom)" },
  { value: "hybrid", label: "Hybrid" },
];

const GOAL_OPTIONS: { value: StudyGoal; label: string }[] = [
  { value: "pass", label: "Pass comfortably" },
  { value: "get_a", label: "Get an A" },
  { value: "understand", label: "Deeply understand the subject" },
  { value: "career", label: "Prepare for future career" },
];

const TIME_OPTIONS: { value: StudyTimePreference; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "both", label: "Both" },
];

function toCourseId(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, "");
}

export default function OnboardingModal() {
  const router = useRouter();
  const { user, setOnboardingComplete } = useApp();
  const [step, setStep] = useState(1);

  // Step 1: Basic profile (name comes from signup – not asked again)
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [funFact, setFunFact] = useState("");

  // Step 2: Courses to add – one empty box, no prefill
  const [courseEntries, setCourseEntries] = useState<{ code: string; skillLevel: SkillLevel }[]>([
    { code: "", skillLevel: "intermediate" },
  ]);

  // Step 3: Study style (multi)
  const [studyStyles, setStudyStyles] = useState<StudyStyle[]>(user.studyStyle?.length ? [...user.studyStyle] : []);

  // Step 4: Where to study (multi)
  const [studyLocations, setStudyLocations] = useState<StudyLocation[]>(user.studyLocation ?? []);

  // Step 5: Goal (single)
  const [studyGoal, setStudyGoal] = useState<StudyGoal | "">(user.studyGoal ?? "");

  // Step 6: Time preference (single)
  const [studyTimePreference, setStudyTimePreference] = useState<StudyTimePreference>("both");

  const toggleStudyStyle = (s: StudyStyle) => {
    setStudyStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const toggleLocation = (loc: StudyLocation) => {
    setStudyLocations((prev) => (prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]));
  };

  const addCourseEntry = () => {
    setCourseEntries((prev) => [...prev, { code: "", skillLevel: "intermediate" }]);
  };

  const removeCourseEntry = (index: number) => {
    if (courseEntries.length <= 1) return;
    setCourseEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCourseEntry = (index: number, code: string, skillLevel?: SkillLevel) => {
    setCourseEntries((prev) => {
      const next = [...prev];
      next[index] = { code: code.trim(), skillLevel: skillLevel ?? next[index].skillLevel };
      return next;
    });
  };

  const handleFinish = () => {
    const coursesWithIds = courseEntries
      .filter((e) => e.code.length > 0)
      .map((e) => ({
        courseId: toCourseId(e.code),
        courseCode: e.code.trim(),
        skillLevel: e.skillLevel,
      }));
    if (coursesWithIds.length === 0) {
      coursesWithIds.push({ courseId: "general", courseCode: "General", skillLevel: "intermediate" });
    }
    const data: OnboardingData = {
      name: user.name,
      major: major.trim(),
      year: year.trim(),
      university: "",
      funFact: funFact.trim() || undefined,
      courses: coursesWithIds,
      studyStyle: studyStyles.length ? studyStyles : ["problem_solving", "discussion"],
      studyLocation: studyLocations,
      studyGoal: studyGoal || "pass",
      studyTimePreference,
    };
    setOnboardingComplete(data);
    router.replace("/dashboard", { scroll: false });
  };

  const canNext = () => {
    if (step === 1) return true;
    if (step === 2) return courseEntries.some((e) => e.code.trim().length > 0);
    if (step === 3) return studyStyles.length > 0;
    if (step === 4) return studyLocations.length > 0;
    if (step === 5) return studyGoal !== "";
    return true;
  };

  const displayName = user.name?.trim() || "there";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <Card padding="lg" className="max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--accent)]">
        <h2 className="text-xl font-bold text-[var(--text)] mb-1">
          {user.name?.trim() ? `Welcome, ${user.name.trim()} 👋` : "Welcome to CourseMate 👋"}
        </h2>
        <p className="text-sm text-[var(--muted)] mb-2">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="h-1.5 rounded-full bg-[var(--surface-hover)] mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step 1: Basic profile (name already from signup) */}
        {step === 1 && (
          <>
            <p className="text-sm font-medium text-[var(--text)] mb-3">Basic profile</p>
            <div className="space-y-3 mb-6">
              <Input label="Major" placeholder="e.g. Computer Science" value={major} onChange={(e) => setMajor(e.target.value)} />
              <Input label="Year" placeholder="e.g. Sophomore, Junior" value={year} onChange={(e) => setYear(e.target.value)} />
              <Input label="Fun fact (optional)" placeholder="Something interesting about you" value={funFact} onChange={(e) => setFunFact(e.target.value)} />
            </div>
            <Button fullWidth onClick={() => setStep(2)}>
              Next
            </Button>
          </>
        )}

        {/* Step 2: Courses to add */}
        {step === 2 && (
          <>
            <p className="text-sm font-medium text-[var(--text)] mb-2">What courses would you like to add?</p>
            <p className="text-xs text-[var(--muted)] mb-3">Course code (e.g. AMS151) and how comfortable you are with the material.</p>
            <div className="space-y-3 mb-4">
              {courseEntries.map((entry, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="e.g. AMS151"
                    value={entry.code}
                    onChange={(e) => updateCourseEntry(i, e.target.value)}
                    className="flex-1 min-w-[120px]"
                  />
                  <select
                    value={entry.skillLevel}
                    onChange={(e) => updateCourseEntry(i, entry.code, e.target.value as SkillLevel)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text)]"
                  >
                    {SKILL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {courseEntries.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCourseEntry(i)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addCourseEntry} className="mb-4">
              + Add another course
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={!canNext()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 3: How do you prefer to study? */}
        {step === 3 && (
          <>
            <p className="text-sm font-medium text-[var(--text)] mb-3">How do you prefer to study?</p>
            <p className="text-xs text-[var(--muted)] mb-3">Select all that apply.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {STUDY_STYLE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleStudyStyle(o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
                    studyStyles.includes(o.value)
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(4)} className="flex-1" disabled={!canNext()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 4: Where + when do you prefer to study? */}
        {step === 4 && (
          <>
            <p className="text-sm font-medium text-[var(--text)] mb-2">Where do you prefer to study?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {LOCATION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleLocation(o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    studyLocations.includes(o.value)
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-[var(--text)] mb-2 mt-4">When do you prefer to study?</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {TIME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setStudyTimePreference(o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    studyTimePreference === o.value
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(5)} className="flex-1" disabled={!canNext()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 5: What's your goal? */}
        {step === 5 && (
          <>
            <p className="text-sm font-medium text-[var(--text)] mb-3">What&apos;s your goal?</p>
            <div className="space-y-2 mb-6">
              {GOAL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setStudyGoal(o.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                    studyGoal === o.value
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(4)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(6)} className="flex-1" disabled={!canNext()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 6: Review / Done */}
        {step === 6 && (
          <>
            <p className="text-sm text-[var(--muted)] mb-6">
              You&apos;re all set, {displayName}. We&apos;ll use this to find your best study matches.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(5)} className="flex-1">Back</Button>
              <Button onClick={handleFinish} className="flex-1">Done</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
