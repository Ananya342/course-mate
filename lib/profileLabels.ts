import type { SkillLevel, StudyStyle, StudyLocation, StudyGoal, StudyTimePreference } from "@/lib/types";

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const STUDY_STYLE_LABELS: Record<StudyStyle, string> = {
  discussion: "Discussion",
  problem_solving: "Problem-solving",
  teaching: "Teaching",
  solo_review: "Solo review",
  quiet_review_together: "Quiet review together",
  structured: "Structured",
  casual: "Casual",
};

export const LOCATION_LABELS: Record<StudyLocation, string> = {
  library: "Library",
  quiet_space: "Quiet space",
  cafe: "Café",
  dorm: "Dorm",
  online: "Online",
  hybrid: "Hybrid",
};

export const GOAL_LABELS: Record<StudyGoal, string> = {
  pass: "Pass comfortably",
  get_a: "Get an A",
  understand: "Deep understanding",
  career: "Career prep",
};

export const TIME_PREF_LABELS: Record<StudyTimePreference, string> = {
  day: "Daytime",
  night: "Evening / night",
  both: "Day & night",
};

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function formatAvailabilityLine(day: string, start: string, end: string): string {
  const d = DAY_LABELS[day.toLowerCase()] ?? day;
  return `${d} ${start}–${end}`;
}
