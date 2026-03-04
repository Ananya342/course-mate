"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  User,
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
  addStudyRequest: (request: Omit<StudyRequest, "id" | "createdAt">) => void;
  createChatGroup: (name: string, courseId: string, memberIds: string[]) => string;
  createDM: (otherUserId: string, otherUserName: string) => string;
  addMessage: (conversationId: string, text: string, senderId: string, attachment?: { name: string; type: string }) => void;
  addQAPost: (courseId: string, title: string, body: string, isAnonymous?: boolean) => void;
  addQAComment: (postId: string, body: string, isInstructor?: boolean, isFollowUp?: boolean) => void;
  upvoteQAPost: (postId: string) => void;
  getMessagesForGroup: (conversationId: string) => Message[];
  setOnboardingComplete: (data: OnboardingData) => void;
  setLoggedIn: (loggedIn: boolean) => void;
};

function getInitialState(): AppState {
  const base = {
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

  const setLoggedIn = useCallback((loggedIn: boolean) => {
    setState((s) => ({ ...s, isLoggedIn: loggedIn }));
  }, []);

  const setOnboardingComplete = useCallback((data: OnboardingData) => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("signupName");
      sessionStorage.removeItem("signupEmail");
    }
    const skillLevel: Record<string, SkillLevel> = {};
    data.courses.forEach((c) => {
      skillLevel[c.courseId] = c.skillLevel;
    });
    setState((s) => {
      const existingIds = new Set(s.courses.map((c) => c.id));
      const newCourses = data.courses.filter((c) => !existingIds.has(c.courseId));
      const coursesToAdd = newCourses.map((c) => ({
        id: c.courseId,
        code: c.courseCode,
        name: c.courseCode,
      }));
      return {
        ...s,
        courses: [...s.courses, ...coursesToAdd],
        hasCompletedOnboarding: true,
        user: {
          ...s.user,
          name: data.name || s.user.name,
          major: data.major,
          year: data.year,
          university: data.university,
          funFact: data.funFact ?? s.user.funFact,
          courses: data.courses.map((c) => c.courseId),
          skillLevel: { ...s.user.skillLevel, ...skillLevel },
          studyStyle: data.studyStyle,
          studyLocation: data.studyLocation,
          studyGoal: data.studyGoal,
          studyTimePreference: data.studyTimePreference,
        },
      };
    });
  }, []);

  const addStudyRequest = useCallback(
    (request: Omit<StudyRequest, "id" | "createdAt">) => {
      const newRequest: StudyRequest = {
        ...request,
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const requestLike = {
        courseId: request.courseId,
        skillLevel: request.skillLevel,
        studyStyle: request.studyStyle,
        availability: request.availability,
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
    []
  );

  const createChatGroup = useCallback(
    (name: string, courseId: string, memberIds: string[]): string => {
      const id = `g-${Date.now()}`;
      const icebreaker =
        ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)];
      const newConv: Conversation = {
        id,
        type: "group",
        name,
        courseId,
        memberIds,
        createdAt: new Date().toISOString(),
        icebreaker,
        lastMessageAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      return id;
    },
    []
  );

  const createDM = useCallback((otherUserId: string, otherUserName: string): string => {
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
  }, [state.conversations, state.user.id]);

  const addMessage = useCallback(
    (
      conversationId: string,
      text: string,
      senderId: string,
      attachment?: { name: string; type: string }
    ) => {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        groupId: conversationId,
        senderId,
        text,
        createdAt: new Date().toISOString(),
        attachment,
      };
      setState((s) => ({
        ...s,
        messages: [...s.messages, newMsg],
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessageAt: new Date().toISOString() }
            : c
        ),
      }));
    },
    []
  );

  const addQAPost = useCallback((
    courseId: string,
    title: string,
    body: string,
    isAnonymous = false
  ) => {
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
    };
    setState((s) => ({ ...s, qaPosts: [newPost, ...s.qaPosts] }));
  }, [state.user.id, state.user.name]);

  const addQAComment = useCallback((
    postId: string,
    body: string,
    isInstructor = false,
    isFollowUp = false
  ) => {
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
  }, [state.user.id, state.user.name]);

  const upvoteQAPost = useCallback((postId: string) => {
    setState((s) => ({
      ...s,
      qaPosts: s.qaPosts.map((p) =>
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      ),
    }));
  }, []);

  const getMessagesForGroup = useCallback(
    (conversationId: string) =>
      state.messages.filter((m) => m.groupId === conversationId).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [state.messages]
  );

  const value: AppContextValue = {
    ...state,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
