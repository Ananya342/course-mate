import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudyRequest, Conversation, Message, QAPost, User, Match } from "@/lib/types";
import { compatibilityScoreWithBreakdown } from "@/lib/scoring";
import {
  profileRowToUser,
  studyRequestRowToApp,
  conversationRowToApp,
  messageRowToApp,
  qaCommentRowToApp,
  buildMatchesFromCandidates,
  type ProfileRow,
} from "./mappers";
import { MOCK_COURSES } from "@/lib/mockData";

export type DashboardDbState = {
  user: User;
  studyRequests: StudyRequest[];
  matches: Match[];
  conversations: Conversation[];
  messages: Message[];
  qaPosts: QAPost[];
  hasCompletedOnboarding: boolean;
};

export async function fetchProfilesForCourse(
  supabase: SupabaseClient,
  courseId: string,
  excludeUserId: string
): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .contains("courses", [courseId])
    .neq("id", excludeUserId);

  if (error || !data) return [];
  return (data as ProfileRow[]).map(profileRowToUser);
}

export async function findExistingDmId(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<string | null> {
  const { data: mine, error: e1 } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  if (e1 || !mine?.length) return null;

  const myConvIds = mine.map((r) => r.conversation_id);

  const { data: convs, error: e2 } = await supabase
    .from("conversations")
    .select("id")
    .eq("type", "dm")
    .in("id", myConvIds);

  if (e2 || !convs?.length) return null;

  for (const c of convs) {
    const { data: members } = await supabase
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", c.id);

    const ids = new Set((members ?? []).map((m) => m.user_id));
    if (ids.size === 2 && ids.has(userId) && ids.has(otherUserId)) {
      return c.id;
    }
  }
  return null;
}

export async function loadDashboardState(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardDbState | null> {
  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profileRow) return null;

  const user = profileRowToUser(profileRow as ProfileRow);

  const { data: reqRows } = await supabase
    .from("study_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const studyRequests = (reqRows ?? []).map((r) =>
    studyRequestRowToApp(r as Parameters<typeof studyRequestRowToApp>[0])
  );

  let matches: Match[] = [];
  if (studyRequests.length > 0) {
    const latest = studyRequests[0];
    const candidates = await fetchProfilesForCourse(supabase, latest.courseId, userId);
    matches = buildMatchesFromCandidates(
      {
        courseId: latest.courseId,
        skillLevel: latest.skillLevel,
        studyStyle: latest.studyStyle,
        availability: latest.availability,
      },
      userId,
      candidates,
      compatibilityScoreWithBreakdown
    );
  }

  const { data: memberRows } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  const convIds = [...new Set((memberRows ?? []).map((m) => m.conversation_id))];

  let conversations: Conversation[] = [];
  let messages: Message[] = [];

  if (convIds.length > 0) {
    const { data: convRows } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    const { data: allMembers } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    const membersByConv = new Map<string, string[]>();
    for (const m of allMembers ?? []) {
      const list = membersByConv.get(m.conversation_id) ?? [];
      list.push(m.user_id);
      membersByConv.set(m.conversation_id, list);
    }

    conversations = (convRows ?? []).map((row) =>
      conversationRowToApp(
        row as Parameters<typeof conversationRowToApp>[0],
        membersByConv.get(row.id) ?? []
      )
    );

    const { data: msgRows } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: true });

    messages = (msgRows ?? []).map((row) =>
      messageRowToApp(row as Parameters<typeof messageRowToApp>[0])
    );
  }

  const courseIds = user.courses.length ? user.courses : MOCK_COURSES.map((c) => c.id);

  const { data: postRows } = await supabase
    .from("qa_posts")
    .select("*")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });

  const postIds = (postRows ?? []).map((p) => p.id);

  type CommentRow = {
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    is_instructor: boolean;
    is_follow_up: boolean;
    created_at: string;
  };
  const commentsByPost = new Map<string, CommentRow[]>();
  const upvoteCounts = new Map<string, number>();

  if (postIds.length > 0) {
    const { data: commentRows } = await supabase
      .from("qa_comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    const authorIds = new Set<string>();
    for (const c of commentRows ?? []) {
      authorIds.add(c.author_id);
    }
    for (const p of postRows ?? []) {
      authorIds.add(p.author_id);
    }

    const { data: authorProfiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", [...authorIds]);

    const nameById = new Map((authorProfiles ?? []).map((a) => [a.id, a.full_name]));

    for (const c of commentRows ?? []) {
      const row = c as CommentRow;
      const list = commentsByPost.get(row.post_id) ?? [];
      list.push(row);
      commentsByPost.set(row.post_id, list);
    }

    const { data: votes } = await supabase
      .from("qa_post_upvotes")
      .select("post_id")
      .in("post_id", postIds);

    for (const v of votes ?? []) {
      upvoteCounts.set(v.post_id, (upvoteCounts.get(v.post_id) ?? 0) + 1);
    }

    const qaPosts: QAPost[] = (postRows ?? []).map((p) => {
      const rawComments = commentsByPost.get(p.id) ?? [];
      const comments: QAPost["comments"] = rawComments.map((c) =>
        qaCommentRowToApp(c, nameById.get(c.author_id) ?? "Student")
      );
      const authorName = p.is_anonymous
        ? "Anonymous"
        : nameById.get(p.author_id) ?? "Student";
      const rowTags = (p as { tags?: string[] | null }).tags;
      return {
        id: p.id,
        courseId: p.course_id,
        title: p.title,
        body: p.body,
        authorId: p.author_id,
        authorName,
        createdAt: p.created_at,
        comments,
        upvotes: upvoteCounts.get(p.id) ?? 0,
        tags: Array.isArray(rowTags) ? rowTags : [],
        isAnonymous: p.is_anonymous,
        isResolved: p.is_resolved ?? false,
      };
    });

    return {
      user,
      studyRequests,
      matches,
      conversations,
      messages,
      qaPosts,
      hasCompletedOnboarding: Boolean(profileRow.has_completed_onboarding),
    };
  }

  return {
    user,
    studyRequests,
    matches,
    conversations,
    messages,
    qaPosts: [],
    hasCompletedOnboarding: Boolean(profileRow.has_completed_onboarding),
  };
}
