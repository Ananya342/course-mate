import type { User, TimeBlock, CompatibilityBreakdown } from "./types";

type RequestLike = {
  courseId: string;
  skillLevel: string;
  studyStyle: string;
  availability: TimeBlock[];
};

function timeBlockOverlap(a: TimeBlock[], b: TimeBlock[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  let overlaps = 0;
  for (const blockA of a) {
    for (const blockB of b) {
      if (blockA.day !== blockB.day) continue;
      const startA = blockA.start;
      const endA = blockA.end;
      const startB = blockB.start;
      const endB = blockB.end;
      if (startA < endB && startB < endA) overlaps++;
    }
  }
  const maxBlocks = Math.max(a.length, b.length, 1);
  return Math.min(100, Math.round((overlaps / maxBlocks) * 100));
}

function studyStyleScore(requestStyle: string, userStyles: string[]): number {
  if (userStyles.includes(requestStyle)) return 100;
  return 50; // partial match
}

function skillLevelScore(requestLevel: string, userLevel: string): number {
  const order = ["beginner", "intermediate", "advanced"];
  const r = order.indexOf(requestLevel);
  const u = order.indexOf(userLevel);
  if (r === -1 || u === -1) return 0;
  const diff = Math.abs(r - u);
  if (diff === 0) return 100;
  if (diff === 1) return 65;
  return 30;
}

export function compatibilityScoreWithBreakdown(
  request: RequestLike,
  user: User
): CompatibilityBreakdown {
  if (!user.courses.includes(request.courseId)) {
    return { availability: 0, studyStyle: 0, skillLevel: 0, overall: 0 };
  }
  const availability = timeBlockOverlap(request.availability, user.availability);
  const studyStyle = studyStyleScore(request.studyStyle, user.studyStyle);
  const userSkill = user.skillLevel[request.courseId] ?? "beginner";
  const skillLevel = skillLevelScore(request.skillLevel, userSkill);

  const overall = Math.round(
    availability * 0.4 + studyStyle * 0.25 + skillLevel * 0.35
  );

  return {
    availability,
    studyStyle,
    skillLevel,
    overall: Math.min(100, overall),
  };
}

export function compatibilityScore(request: RequestLike, user: User): number {
  return compatibilityScoreWithBreakdown(request, user).overall;
}
