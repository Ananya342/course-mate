export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type StudyStyle =
  | "discussion"
  | "problem_solving"
  | "teaching"
  | "solo_review"
  | "quiet_review_together"
  | "structured"
  | "casual";

export type StudyLocation =
  | "library"
  | "quiet_space"
  | "cafe"
  | "dorm"
  | "online"
  | "hybrid";

export type StudyGoal = "pass" | "get_a" | "understand" | "career";
export type StudyTimePreference = "day" | "night" | "both";

export interface TimeBlock {
  day: string; // "mon" | "tue" | ...
  start: string; // "09:00"
  end: string;   // "11:00"
}

export interface UserSocials {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  discord?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  major?: string;
  year?: string;
  university?: string;
  courses: string[];
  skillLevel: Record<string, SkillLevel>;
  studyStyle: StudyStyle[];
  studyLocation?: StudyLocation[];
  studyGoal?: StudyGoal;
  studyTimePreference?: StudyTimePreference;
  availability: TimeBlock[];
  funFact?: string;
  socials?: UserSocials;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface StudyRequest {
  id: string;
  userId: string;
  courseId: string;
  skillLevel: SkillLevel;
  studyStyle: StudyStyle;
  availability: TimeBlock[];
  createdAt: string;
}

export interface CompatibilityBreakdown {
  availability: number;
  studyStyle: number;
  skillLevel: number;
  overall: number;
}

export interface Match {
  id: string;
  user: User;
  courseId: string;
  breakdown: CompatibilityBreakdown;
}

export interface ChatGroup {
  id: string;
  name: string;
  courseId: string;
  memberIds: string[];
  createdAt: string;
  icebreaker?: string;
}

export type ConversationType = "dm" | "group";

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  courseId?: string;
  memberIds: string[];
  createdAt: string;
  icebreaker?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  groupId: string; // conversation id (dm or group)
  senderId: string;
  text: string;
  createdAt: string;
  attachment?: { name: string; type: string };
}

export interface QAComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  isInstructor?: boolean;
  isFollowUp?: boolean;
  parentCommentId?: string;
}

export interface QAPost {
  id: string;
  courseId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  comments: QAComment[];
  upvotes: number;
  isAnonymous?: boolean;
  isResolved?: boolean;
  instructorAnswered?: boolean;
  endorsedByInstructor?: boolean;
}
