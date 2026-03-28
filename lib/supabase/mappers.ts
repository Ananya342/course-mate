import type {
  User,
  SkillLevel,
  StudyStyle,
  StudyLocation,
  StudyGoal,
  StudyTimePreference,
  TimeBlock,
  StudyRequest,
  Match,
  Conversation,
  Message,
  QAPost,
  QAComment,
  UserSocials,
} from "@/lib/types";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  major: string | null;
  year: string | null;
  university: string | null;
  fun_fact: string | null;
  courses: string[] | null;
  skill_level: Record<string, SkillLevel> | null;
  study_style: string[] | null;
  study_location: string[] | null;
  study_goal: string | null;
  study_time_preference: string | null;
  availability: TimeBlock[] | null;
  socials: UserSocials | null;
  has_completed_onboarding: boolean | null;
};

export function profileRowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? "",
    avatar: row.avatar_url ?? undefined,
    major: row.major ?? undefined,
    year: row.year ?? undefined,
    university: row.university ?? undefined,
    courses: row.courses ?? [],
    skillLevel: (row.skill_level as Record<string, SkillLevel>) ?? {},
    studyStyle: (row.study_style as StudyStyle[]) ?? [],
    studyLocation: (row.study_location as StudyLocation[]) ?? undefined,
    studyGoal: (row.study_goal as StudyGoal) ?? undefined,
    studyTimePreference: (row.study_time_preference as StudyTimePreference) ?? undefined,
    availability: row.availability ?? [],
    funFact: row.fun_fact ?? undefined,
    socials: row.socials ?? undefined,
  };
}

export function studyRequestRowToApp(row: {
  id: string;
  user_id: string;
  course_id: string;
  skill_level: string;
  study_style: string;
  availability: TimeBlock[] | null;
  created_at: string;
}): StudyRequest {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    skillLevel: row.skill_level as SkillLevel,
    studyStyle: row.study_style as StudyStyle,
    availability: row.availability ?? [],
    createdAt: row.created_at,
  };
}

export function conversationRowToApp(
  row: {
    id: string;
    type: string;
    name: string;
    course_id: string | null;
    icebreaker: string | null;
    created_at: string;
    last_message_at: string | null;
  },
  memberIds: string[]
): Conversation {
  return {
    id: row.id,
    type: row.type as "dm" | "group",
    name: row.name,
    courseId: row.course_id ?? undefined,
    memberIds,
    createdAt: row.created_at,
    icebreaker: row.icebreaker ?? undefined,
    lastMessageAt: row.last_message_at ?? undefined,
  };
}

export function messageRowToApp(row: {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  attachment: { name: string; type: string } | null;
  created_at: string;
}): Message {
  return {
    id: row.id,
    groupId: row.conversation_id,
    senderId: row.sender_id ?? "system",
    text: row.body,
    createdAt: row.created_at,
    attachment: row.attachment ?? undefined,
  };
}

export function qaCommentRowToApp(row: {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_instructor: boolean;
  is_follow_up: boolean;
  created_at: string;
}, authorName: string): QAComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName,
    body: row.body,
    createdAt: row.created_at,
    isInstructor: row.is_instructor,
    isFollowUp: row.is_follow_up,
  };
}

export function buildMatchesFromCandidates(
  requestLike: {
    courseId: string;
    skillLevel: string;
    studyStyle: string;
    availability: TimeBlock[];
  },
  currentUserId: string,
  candidates: User[],
  scoreFn: typeof import("@/lib/scoring").compatibilityScoreWithBreakdown
): Match[] {
  const filtered = candidates.filter(
    (u) => u.id !== currentUserId && u.courses.includes(requestLike.courseId)
  );
  return filtered
    .map((u) => {
      const breakdown = scoreFn(requestLike, u);
      if (breakdown.overall === 0) return null;
      return { id: `match-${u.id}`, user: u, courseId: requestLike.courseId, breakdown };
    })
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.breakdown.overall - a.breakdown.overall)
    .slice(0, 5);
}
