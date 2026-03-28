import type { Course, User } from "@/lib/types";

/**
 * Maps enrolled course ids to catalog entries when possible; otherwise builds a display label.
 * Avoids empty course lists when onboarding ids don't match MOCK_COURSES (e.g. custom course codes).
 */
export function resolveEnrolledCourses(user: User, catalog: Course[]): Course[] {
  if (!user.courses?.length) return [];
  const byId = new Map(catalog.map((c) => [c.id, c]));
  return user.courses.map((id) => {
    const hit = byId.get(id);
    if (hit) return hit;
    const code = id
      .replace(/([a-z])([0-9])/gi, "$1 $2")
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
    return {
      id,
      code: code.toUpperCase().replace(/\s+/g, " ").trim() || id.toUpperCase(),
      name: code || id,
    };
  });
}
