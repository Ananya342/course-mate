"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type {
  User,
  UserSocials,
  StudyRequest,
  Match,
  Message,
  QAPost,
  QAComment,
  Conversation,
  SkillLevel,
  StudyStyle,
  StudyLocation,
  StudyGoal,
  StudyTimePreference,
} from "@/lib/types";

export type ProfileBasicsPatch = {
  name?: string;
  major?: string;
  year?: string;
  university?: string;
  funFact?: string;
  socials?: UserSocials;
};

export type OnboardingData = {
  name: string;
  major: string;
  year: string;
  university: string;
  funFact?: string;
  courses: { courseId: string; courseCode: string; skillLevel: SkillLevel }[];
  studyStyle: StudyStyle[];
  studyLocation: StudyLocation[];
  studyGoal: StudyGoal;
  studyTimePreference: StudyTimePreference;
};
import {
  MOCK_USER,
  MOCK_COURSES,
  MOCK_MATCHES,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_QA_POSTS,
  ICEBREAKER_QUESTIONS,
} from "@/lib/mockData";
import { compatibilityScoreWithBreakdown } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { loadDashboardState, findExistingDmId } from "@/lib/supabase/dashboard-data";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Relaxed UUID check for filtering mock member ids (e.g. "u1") out of DB writes */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Session user id must match row user_id/author_id or RLS rejects the write */
async function getAuthUserId(client: SupabaseClient): Promise<string | null> {
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    const { data, error } = await client.auth.getUser();
    if (error) console.error("getAuthUserId:", error.message);
    return data.user?.id ?? null;
  }
  return sessionData.session.user.id;
}

type AppState = {
  user: User;
  courses: typeof MOCK_COURSES;
  studyRequests: StudyRequest[];
  matches: Match[];
  conversations: Conversation[];
  messages: Message[];
  qaPosts: QAPost[];
  hasCompletedOnboarding: boolean;
  isLoggedIn: boolean;
};

type AppContextValue = AppState & {
  authReady: boolean;
  addStudyRequest: (request: Omit<StudyRequest, "id" | "createdAt">) => Promise<void>;
  createChatGroup: (name: string, courseId: string, memberIds: string[]) => Promise<string>;
  createDM: (otherUserId: string, otherUserName: string) => Promise<string>;
  addMessage: (
    conversationId: string,
    text: string,
    senderId: string,
    attachment?: { name: string; type: string }
  ) => Promise<void>;
  addQAPost: (
    courseId: string,
    title: string,
    body: string,
    isAnonymous?: boolean,
    tags?: string[]
  ) => Promise<boolean>;
  addQAComment: (
    postId: string,
    body: string,
    isInstructor?: boolean,
    isFollowUp?: boolean
  ) => Promise<void>;
  upvoteQAPost: (postId: string) => Promise<void>;
  getMessagesForGroup: (conversationId: string) => Message[];
  setOnboardingComplete: (data: OnboardingData) => Promise<void>;
  setLoggedIn: (loggedIn: boolean) => void;
  signOut: () => Promise<void>;
  refreshFromSupabase: () => Promise<void>;
  updateProfileBasics: (patch: ProfileBasicsPatch) => Promise<void>;
};

function getInitialState(): AppState {
  const base: AppState = {
    user: MOCK_USER,
    courses: MOCK_COURSES,
    studyRequests: [],
    matches: MOCK_MATCHES,
    conversations: MOCK_CONVERSATIONS,
    messages: MOCK_MESSAGES,
    qaPosts: MOCK_QA_POSTS,
    hasCompletedOnboarding: true,
    isLoggedIn: false,
  };
  if (typeof window === "undefined") return base;
  const signupName = sessionStorage.getItem("signupName");
  const signupEmail = sessionStorage.getItem("signupEmail");
  if (signupName || signupEmail) {
    return {
      ...base,
      user: {
        ...base.user,
        name: signupName ?? base.user.name,
        email: signupEmail ?? base.user.email,
      },
    };
  }
  return base;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured());

  const supabase = useMemo(() => {
    if (!isSupabaseConfigured()) return null;
    try {
      return createBrowserSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const refreshFromSupabase = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;
    const data = await loadDashboardState(supabase, authUser.id);
    if (!data) return;
    setState((s) => ({
      ...s,
      user: data.user,
      studyRequests: data.studyRequests,
      matches: data.matches,
      conversations: data.conversations,
      messages: data.messages,
      qaPosts: data.qaPosts,
      hasCompletedOnboarding: data.hasCompletedOnboarding,
      courses: MOCK_COURSES,
      isLoggedIn: true,
    }));
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    const applyUser = async (userId: string | undefined) => {
      if (!userId) {
        if (!cancelled) {
          setState(() => ({ ...getInitialState(), isLoggedIn: false }));
          setAuthReady(true);
        }
        return;
      }
      const data = await loadDashboardState(supabase, userId);
      if (cancelled) return;
      if (data) {
        setState((s) => ({
          ...s,
          user: data.user,
          studyRequests: data.studyRequests,
          matches: data.matches,
          conversations: data.conversations,
          messages: data.messages,
          qaPosts: data.qaPosts,
          hasCompletedOnboarding: data.hasCompletedOnboarding,
          courses: MOCK_COURSES,
          isLoggedIn: true,
        }));
      } else {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (!cancelled && u) {
          const meta = u.user_metadata as { full_name?: string } | undefined;
          const { error: upErr } = await supabase.from("profiles").upsert(
            {
              id: u.id,
              email: u.email ?? null,
              full_name:
                meta?.full_name ?? u.email?.split("@")[0] ?? "Student",
            },
            { onConflict: "id" }
          );
          if (upErr) {
            console.error("profiles upsert:", upErr.message, upErr.code, upErr.details);
          }
          const retry = await loadDashboardState(supabase, u.id);
          if (!cancelled && retry) {
            setState((s) => ({
              ...s,
              user: retry.user,
              studyRequests: retry.studyRequests,
              matches: retry.matches,
              conversations: retry.conversations,
              messages: retry.messages,
              qaPosts: retry.qaPosts,
              hasCompletedOnboarding: retry.hasCompletedOnboarding,
              courses: MOCK_COURSES,
              isLoggedIn: true,
            }));
          } else if (!cancelled) {
            setState((s) => ({
              ...s,
              user: {
                ...s.user,
                id: u.id,
                email: u.email ?? s.user.email,
              },
              isLoggedIn: true,
              courses: MOCK_COURSES,
            }));
          }
        }
      }
      if (!cancelled) setAuthReady(true);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void applyUser(session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser(session?.user?.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const setLoggedIn = useCallback((loggedIn: boolean) => {
    setState((s) => ({ ...s, isLoggedIn: loggedIn }));
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setState(() => ({ ...getInitialState(), isLoggedIn: false }));
  }, [supabase]);

  const updateProfileBasics = useCallback(
    async (patch: ProfileBasicsPatch) => {
      setState((s) => ({
        ...s,
        user: {
          ...s.user,
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.major !== undefined && { major: patch.major }),
          ...(patch.year !== undefined && { year: patch.year }),
          ...(patch.university !== undefined && { university: patch.university }),
          ...(patch.funFact !== undefined && { funFact: patch.funFact }),
          ...(patch.socials !== undefined && { socials: patch.socials }),
        },
      }));

      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) return;
        const row: Record<string, unknown> = {};
        if (patch.name !== undefined) row.full_name = patch.name;
        if (patch.major !== undefined) row.major = patch.major || null;
        if (patch.year !== undefined) row.year = patch.year || null;
        if (patch.university !== undefined) row.university = patch.university || null;
        if (patch.funFact !== undefined) row.fun_fact = patch.funFact || null;
        if (patch.socials !== undefined) row.socials = patch.socials ?? {};
        if (Object.keys(row).length > 0) {
          const { error } = await supabase.from("profiles").update(row).eq("id", authUserId);
          if (error) {
            console.error("profiles update:", error.message, error.code, error.details);
            return;
          }
        }
        await refreshFromSupabase();
      }
    },
    [supabase, refreshFromSupabase]
  );

  const setOnboardingComplete = useCallback(
    async (data: OnboardingData) => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("signupName");
        sessionStorage.removeItem("signupEmail");
      }
      const skillLevel: Record<string, SkillLevel> = {};
      data.courses.forEach((c) => {
        skillLevel[c.courseId] = c.skillLevel;
      });

      const existingIds = new Set(state.courses.map((c) => c.id));
      const newCourses = data.courses.filter((c) => !existingIds.has(c.courseId));
      const coursesToAdd = newCourses.map((c) => ({
        id: c.courseId,
        code: c.courseCode,
        name: c.courseCode,
      }));

      const mergedSkill = { ...state.user.skillLevel, ...skillLevel };
      const nextUser: User = {
        ...state.user,
        name: data.name || state.user.name,
        major: data.major,
        year: data.year,
        university: data.university,
        funFact: data.funFact ?? state.user.funFact,
        courses: data.courses.map((c) => c.courseId),
        skillLevel: mergedSkill,
        studyStyle: data.studyStyle,
        studyLocation: data.studyLocation,
        studyGoal: data.studyGoal,
        studyTimePreference: data.studyTimePreference,
      };

      setState((s) => ({
        ...s,
        courses: [...s.courses, ...coursesToAdd],
        hasCompletedOnboarding: true,
        user: nextUser,
      }));

      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (authUserId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              full_name: data.name || state.user.name,
              major: data.major,
              year: data.year,
              university: data.university,
              fun_fact: data.funFact ?? null,
              courses: data.courses.map((c) => c.courseId),
              skill_level: mergedSkill,
              study_style: data.studyStyle,
              study_location: data.studyLocation,
              study_goal: data.studyGoal,
              study_time_preference: data.studyTimePreference,
              has_completed_onboarding: true,
            })
            .eq("id", authUserId);
          if (error) {
            console.error("profiles update:", error.message, error.code, error.details);
          } else {
            await refreshFromSupabase();
          }
        }
      }
    },
    [state.courses, state.user, supabase, refreshFromSupabase]
  );

  const addStudyRequest = useCallback(
    async (request: Omit<StudyRequest, "id" | "createdAt">) => {
      const requestLike = {
        courseId: request.courseId,
        skillLevel: request.skillLevel,
        studyStyle: request.studyStyle,
        availability: request.availability,
      };

      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("study_requests: no authenticated user");
          return;
        }
        const { error } = await supabase.from("study_requests").insert({
          user_id: authUserId,
          course_id: request.courseId,
          skill_level: request.skillLevel,
          study_style: request.studyStyle,
          availability: request.availability,
        });
        if (error) {
          console.error("study_requests insert:", error.message, error.code, error.details);
          return;
        }
        await refreshFromSupabase();
        return;
      }

      const newRequest: StudyRequest = {
        ...request,
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const allUsers = [MOCK_USER, ...MOCK_MATCHES.map((m) => m.user)];
      const uniq = allUsers.filter((u, i, a) => a.findIndex((x) => x.id === u.id) === i);
      const candidates = uniq.filter(
        (u) => u.id !== request.userId && u.courses.includes(request.courseId)
      );
      const newMatches: Match[] = candidates
        .map((u) => {
          const breakdown = compatibilityScoreWithBreakdown(requestLike, u);
          if (breakdown.overall === 0) return null;
          return { id: `match-${u.id}`, user: u, courseId: request.courseId, breakdown };
        })
        .filter((m): m is Match => m !== null)
        .sort((a, b) => b.breakdown.overall - a.breakdown.overall)
        .slice(0, 5);
      setState((s) => ({
        ...s,
        studyRequests: [...s.studyRequests, newRequest],
        matches: newMatches.length ? newMatches : s.matches,
      }));
    },
    [supabase, refreshFromSupabase]
  );

  const createChatGroup = useCallback(
    async (name: string, courseId: string, memberIds: string[]): Promise<string> => {
      const icebreaker =
        ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)];
      const now = new Date().toISOString();

      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("createChatGroup: no authenticated user");
          return `g-${Date.now()}`;
        }
        const uniqueMembers = [...new Set([...memberIds, authUserId])].filter(isUuid);
        const { data: conv, error: ce } = await supabase
          .from("conversations")
          .insert({
            type: "group",
            name,
            course_id: courseId,
            icebreaker,
            last_message_at: now,
          })
          .select("id")
          .single();
        if (ce || !conv) {
          console.error("conversations insert:", ce);
          return `g-${Date.now()}`;
        }
        const rows = uniqueMembers.map((user_id) => ({
          conversation_id: conv.id,
          user_id,
        }));
        if (rows.length) {
          const { error: me } = await supabase.from("conversation_members").insert(rows);
          if (me) console.error("conversation_members insert:", me);
        }
        await supabase.from("messages").insert({
          conversation_id: conv.id,
          sender_id: null,
          body: `Icebreaker: ${icebreaker}`,
        });
        await refreshFromSupabase();
        return conv.id;
      }

      const id = `g-${Date.now()}`;
      const newConv: Conversation = {
        id,
        type: "group",
        name,
        courseId,
        memberIds,
        createdAt: now,
        icebreaker,
        lastMessageAt: now,
      };
      setState((s) => ({
        ...s,
        conversations: [newConv, ...s.conversations],
        messages: [
          ...s.messages,
          {
            id: `msg-${Date.now()}`,
            groupId: id,
            senderId: "system",
            text: `Icebreaker: ${icebreaker}`,
            createdAt: now,
          },
        ],
      }));
      return id;
    },
    [supabase, state.user.id, refreshFromSupabase]
  );

  const createDM = useCallback(
    async (otherUserId: string, otherUserName: string): Promise<string> => {
      if (supabase && isUuid(otherUserId)) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("createDM: no authenticated user");
          return `dm-${otherUserId}`;
        }
        const existing = await findExistingDmId(supabase, authUserId, otherUserId);
        if (existing) return existing;
        const now = new Date().toISOString();
        const { data: conv, error: ce } = await supabase
          .from("conversations")
          .insert({
            type: "dm",
            name: otherUserName,
            last_message_at: now,
          })
          .select("id")
          .single();
        if (ce || !conv) {
          console.error("dm conversation insert:", ce);
          return `dm-${otherUserId}`;
        }
        await supabase.from("conversation_members").insert([
          { conversation_id: conv.id, user_id: authUserId },
          { conversation_id: conv.id, user_id: otherUserId },
        ]);
        await refreshFromSupabase();
        return conv.id;
      }

      const existing = state.conversations.find(
        (c) => c.type === "dm" && c.memberIds.includes(otherUserId)
      );
      if (existing) return existing.id;
      const id = `dm-${otherUserId}`;
      const newConv: Conversation = {
        id,
        type: "dm",
        name: otherUserName,
        memberIds: [state.user.id, otherUserId],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        conversations: [newConv, ...s.conversations],
      }));
      return id;
    },
    [supabase, state.conversations, state.user.id, refreshFromSupabase]
  );

  const addMessage = useCallback(
    async (
      conversationId: string,
      text: string,
      senderId: string,
      attachment?: { name: string; type: string }
    ) => {
      const now = new Date().toISOString();
      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("addMessage: no authenticated user");
          return;
        }
        const { error } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: senderId === "system" ? null : authUserId,
          body: text,
          attachment: attachment ?? null,
        });
        if (error) {
          console.error("messages insert:", error.message, error.code, error.details);
          return;
        }
        await supabase
          .from("conversations")
          .update({ last_message_at: now })
          .eq("id", conversationId);
        await refreshFromSupabase();
        return;
      }

      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        groupId: conversationId,
        senderId,
        text,
        createdAt: now,
        attachment,
      };
      setState((s) => ({
        ...s,
        messages: [...s.messages, newMsg],
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, lastMessageAt: now } : c
        ),
      }));
    },
    [supabase, refreshFromSupabase]
  );

  const addQAPost = useCallback(
    async (
      courseId: string,
      title: string,
      body: string,
      isAnonymous = false,
      tags: string[] = []
    ): Promise<boolean> => {
      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("qa_posts: no authenticated user");
          return false;
        }
        const { error } = await supabase.from("qa_posts").insert({
          course_id: courseId,
          author_id: authUserId,
          title,
          body,
          is_anonymous: isAnonymous,
          tags: tags.length ? tags : [],
        });
        if (error) {
          console.error("qa_posts insert:", error.message, error.code, error.details);
          return false;
        }
        await refreshFromSupabase();
        return true;
      }

      const newPost: QAPost = {
        id: `qa-${Date.now()}`,
        courseId,
        title,
        body,
        authorId: state.user.id,
        authorName: isAnonymous ? "Anonymous" : state.user.name,
        createdAt: new Date().toISOString(),
        comments: [],
        upvotes: 0,
        isAnonymous,
        tags: tags.length ? tags : undefined,
      };
      setState((s) => ({ ...s, qaPosts: [newPost, ...s.qaPosts] }));
      return true;
    },
    [supabase, state.user.id, state.user.name, refreshFromSupabase]
  );

  const addQAComment = useCallback(
    async (
      postId: string,
      body: string,
      isInstructor = false,
      isFollowUp = false
    ) => {
      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("qa_comments: no authenticated user");
          return;
        }
        const { error } = await supabase.from("qa_comments").insert({
          post_id: postId,
          author_id: authUserId,
          body,
          is_instructor: isInstructor,
          is_follow_up: isFollowUp,
        });
        if (error) {
          console.error("qa_comments insert:", error.message, error.code, error.details);
          return;
        }
        await refreshFromSupabase();
        return;
      }

      const newComment: QAComment = {
        id: `c-${Date.now()}`,
        postId,
        authorId: state.user.id,
        authorName: isInstructor ? "Prof. Smith" : state.user.name,
        body,
        createdAt: new Date().toISOString(),
        isInstructor,
        isFollowUp,
      };
      setState((s) => ({
        ...s,
        qaPosts: s.qaPosts.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        ),
      }));
    },
    [supabase, state.user.id, state.user.name, refreshFromSupabase]
  );

  const upvoteQAPost = useCallback(
    async (postId: string) => {
      if (supabase) {
        const authUserId = await getAuthUserId(supabase);
        if (!authUserId) {
          console.error("qa_post_upvotes: no authenticated user");
          return;
        }
        const { error } = await supabase.from("qa_post_upvotes").insert({
          post_id: postId,
          user_id: authUserId,
        });
        const dup =
          error?.code === "23505" ||
          error?.message?.toLowerCase().includes("duplicate");
        if (error && !dup) {
          console.error("qa_post_upvotes insert:", error);
          return;
        }
        await refreshFromSupabase();
        return;
      }

      setState((s) => ({
        ...s,
        qaPosts: s.qaPosts.map((p) =>
          p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
        ),
      }));
    },
    [supabase, state.user.id, refreshFromSupabase]
  );

  const getMessagesForGroup = useCallback(
    (conversationId: string) =>
      state.messages
        .filter((m) => m.groupId === conversationId)
        .sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [state.messages]
  );

  const value: AppContextValue = {
    ...state,
    authReady,
    addStudyRequest,
    createChatGroup,
    createDM,
    addMessage,
    addQAPost,
    addQAComment,
    upvoteQAPost,
    getMessagesForGroup,
    setOnboardingComplete,
    setLoggedIn,
    signOut,
    refreshFromSupabase,
    updateProfileBasics,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
