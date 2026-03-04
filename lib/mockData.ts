import type { User, Course, Match, ChatGroup, Message, QAPost, TimeBlock, Conversation } from "./types";
import { compatibilityScoreWithBreakdown } from "./scoring";

export const MOCK_COURSES: Course[] = [
  { id: "cs101", name: "Introduction to Computer Science", code: "CS 101" },
  { id: "cs201", name: "Data Structures", code: "CS 201" },
  { id: "math101", name: "Calculus I", code: "MATH 101" },
  { id: "phys101", name: "Physics I", code: "PHYS 101" },
];

const defaultAvailability: TimeBlock[] = [
  { day: "mon", start: "09:00", end: "11:00" },
  { day: "wed", start: "14:00", end: "16:00" },
  { day: "fri", start: "10:00", end: "12:00" },
];

export const MOCK_USER: User = {
  id: "me",
  name: "Alex Chen",
  email: "alex.chen@university.edu",
  courses: ["cs101", "cs201", "math101"],
  skillLevel: { cs101: "intermediate", cs201: "beginner", math101: "advanced" },
  studyStyle: ["problem_solving", "discussion"],
  availability: defaultAvailability,
  funFact: "I once debugged code in my sleep (literally dreamed the fix).",
  socials: { instagram: "alex.codes", twitter: "alexchen_dev", discord: "alex#1234" },
};

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Jordan Lee",
    email: "jordan.lee@university.edu",
    courses: ["cs101", "cs201"],
    skillLevel: { cs101: "intermediate", cs201: "intermediate" },
    studyStyle: ["discussion", "problem_solving"],
    availability: [
      { day: "mon", start: "09:00", end: "11:00" },
      { day: "wed", start: "14:00", end: "16:00" },
    ],
    funFact: "Can solve a Rubik's cube in under 2 minutes.",
    socials: { instagram: "jordan.lee", linkedin: "jordanlee" },
  },
  {
    id: "u2",
    name: "Sam Rivera",
    email: "sam.rivera@university.edu",
    courses: ["cs101", "math101"],
    skillLevel: { cs101: "advanced", math101: "intermediate" },
    studyStyle: ["teaching", "problem_solving"],
    availability: [
      { day: "tue", start: "10:00", end: "12:00" },
      { day: "thu", start: "15:00", end: "17:00" },
      { day: "fri", start: "10:00", end: "12:00" },
    ],
    funFact: "Learned to code by modding Minecraft.",
    socials: { twitter: "samcodes", discord: "sam#5678" },
  },
  {
    id: "u3",
    name: "Casey Kim",
    email: "casey.kim@university.edu",
    courses: ["cs201", "math101"],
    skillLevel: { cs201: "beginner", math101: "beginner" },
    studyStyle: ["solo_review", "discussion"],
    availability: [
      { day: "mon", start: "14:00", end: "16:00" },
      { day: "wed", start: "14:00", end: "16:00" },
      { day: "fri", start: "10:00", end: "12:00" },
    ],
    funFact: "Study best with lo-fi beats and rain sounds.",
    socials: { instagram: "caseykim.study" },
  },
  {
    id: "u4",
    name: "Morgan Taylor",
    email: "morgan.taylor@university.edu",
    courses: ["cs101"],
    skillLevel: { cs101: "intermediate" },
    studyStyle: ["discussion", "teaching"],
    availability: defaultAvailability,
    funFact: "Takes notes in 5 different highlight colors.",
    socials: { linkedin: "morgantaylor", twitter: "morgan_t" },
  },
  {
    id: "u5",
    name: "Riley Davis",
    email: "riley.davis@university.edu",
    courses: ["cs201", "phys101"],
    skillLevel: { cs201: "intermediate", phys101: "advanced" },
    studyStyle: ["problem_solving"],
    availability: [
      { day: "mon", start: "09:00", end: "11:00" },
      { day: "thu", start: "16:00", end: "18:00" },
    ],
    funFact: "Has a pet cactus named Stack.",
    socials: { instagram: "riley.davis", discord: "riley#9012" },
  },
];

// Extended campus directory for search (mock "database of people on campus")
export const CAMPUS_PEOPLE: User[] = [
  ...MOCK_USERS,
  {
    id: "u6",
    name: "Jamie Park",
    email: "jamie.park@university.edu",
    courses: ["cs101", "math101"],
    skillLevel: { cs101: "beginner", math101: "intermediate" },
    studyStyle: ["discussion"],
    availability: defaultAvailability,
    funFact: "Double major in CS and Art.",
    socials: { instagram: "jamie.park" },
  },
  {
    id: "u7",
    name: "Taylor Nguyen",
    email: "taylor.n@university.edu",
    courses: ["cs201", "phys101"],
    skillLevel: { cs201: "advanced", phys101: "intermediate" },
    studyStyle: ["teaching", "problem_solving"],
    availability: [{ day: "tue", start: "14:00", end: "16:00" }, { day: "thu", start: "14:00", end: "16:00" }],
    funFact: "Built a robot that fetches coffee.",
    socials: { linkedin: "taylornguyen", twitter: "taylor_dev" },
  },
  {
    id: "u8",
    name: "Quinn Adams",
    email: "quinn.a@university.edu",
    courses: ["math101"],
    skillLevel: { math101: "advanced" },
    studyStyle: ["solo_review", "teaching"],
    availability: [{ day: "mon", start: "10:00", end: "12:00" }, { day: "wed", start: "10:00", end: "12:00" }],
    funFact: "Loves explaining calculus with memes.",
    socials: { instagram: "quinn.adams", discord: "quinn#3456" },
  },
];

const myRequest = {
  courseId: "cs101",
  skillLevel: "intermediate" as const,
  studyStyle: "problem_solving" as const,
  availability: MOCK_USER.availability,
};

function buildMockMatches(): Match[] {
  const candidates = MOCK_USERS.filter((u) => u.courses.includes(myRequest.courseId));
  return candidates
    .map((user) => {
      const breakdown = compatibilityScoreWithBreakdown(myRequest, user);
      if (breakdown.overall === 0) return null;
      return {
        id: `match-${user.id}`,
        user,
        courseId: myRequest.courseId,
        breakdown,
      };
    })
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.breakdown.overall - a.breakdown.overall)
    .slice(0, 5);
}

export const MOCK_MATCHES = buildMockMatches();

export const ICEBREAKER_QUESTIONS = [
  "If this exam were a movie, what genre would it be?",
  "What topic confuses you the most right now?",
  "What's your go-to study snack?",
  "Coffee or tea when cramming?",
  "What's one thing you wish the professor had explained better?",
  "Pomodoro timer or all-nighter?",
];

export const MOCK_CHAT_GROUPS: ChatGroup[] = [
  {
    id: "g1",
    name: "CS 101 - Study Group",
    courseId: "cs101",
    memberIds: ["me", "u1", "u4"],
    createdAt: new Date().toISOString(),
    icebreaker: ICEBREAKER_QUESTIONS[0],
  },
];

// Conversations = groups + DMs (GroupMe-style list)
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "g1",
    type: "group",
    name: "CS 101 - Study Group",
    courseId: "cs101",
    memberIds: ["me", "u1", "u4"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    icebreaker: ICEBREAKER_QUESTIONS[0],
    lastMessageAt: new Date(Date.now() - 84000000).toISOString(),
  },
  {
    id: "dm-u1",
    type: "dm",
    name: "Jordan Lee",
    memberIds: ["me", "u1"],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    lastMessageAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: "dm-u2",
    type: "dm",
    name: "Sam Rivera",
    memberIds: ["me", "u2"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const MOCK_MESSAGES: Message[] = [
  { id: "m1", groupId: "g1", senderId: "system", text: "Group created. Say hi!", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "m2", groupId: "g1", senderId: "u1", text: "Hey everyone! Ready to grind?", createdAt: new Date(Date.now() - 86000000).toISOString() },
  { id: "m3", groupId: "g1", senderId: "me", text: "Yes! When do you all want to meet?", createdAt: new Date(Date.now() - 85000000).toISOString() },
  { id: "m4", groupId: "g1", senderId: "u4", text: "How about Wednesday 2pm?", createdAt: new Date(Date.now() - 84000000).toISOString() },
  { id: "dm1", groupId: "dm-u1", senderId: "u1", text: "Want to review the problem set together?", createdAt: new Date(Date.now() - 36000000).toISOString() },
  { id: "dm2", groupId: "dm-u1", senderId: "me", text: "Sure, tomorrow work?", createdAt: new Date(Date.now() - 35800000).toISOString() },
  { id: "dm3", groupId: "dm-u2", senderId: "me", text: "Thanks for the Big O explanation!", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "dm4", groupId: "dm-u2", senderId: "u2", text: "Anytime! Good luck on the quiz", createdAt: new Date(Date.now() - 3500000).toISOString() },
];

export const MOCK_QA_POSTS: QAPost[] = [
  {
    id: "qa1",
    courseId: "cs101",
    title: "Clarification on Big O for recursion",
    body: "In the last lecture we did the recursive Fibonacci example. Can someone explain why it's O(2^n)?",
    authorId: "u2",
    authorName: "Sam Rivera",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    upvotes: 12,
    instructorAnswered: true,
    endorsedByInstructor: true,
    isResolved: true,
    comments: [
      { id: "c1", postId: "qa1", authorId: "me", authorName: "Alex Chen", body: "It's because each call branches into two more calls, so the call tree doubles at each level.", createdAt: new Date(Date.now() - 172000000).toISOString() },
      { id: "c-instr", postId: "qa1", authorId: "instructor", authorName: "Prof. Smith", body: "Great question. I've endorsed Alex's answer—that's the right intuition. Formally we solve the recurrence T(n) = T(n-1) + T(n-2) + O(1).", createdAt: new Date(Date.now() - 171500000).toISOString(), isInstructor: true },
    ],
  },
  {
    id: "qa2",
    courseId: "cs101",
    title: "Office hours this week?",
    body: "Are office hours still 3-5pm on Thursdays?",
    authorId: "u1",
    authorName: "Jordan Lee",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    upvotes: 5,
    comments: [],
  },
  {
    id: "qa3",
    courseId: "cs201",
    title: "BST vs Hash Table for lookups",
    body: "When would you pick one over the other for a lookup-heavy application?",
    authorId: "me",
    authorName: "Alex Chen",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    upvotes: 8,
    comments: [
      { id: "c2", postId: "qa3", authorId: "u5", authorName: "Riley Davis", body: "Hash table for O(1) average if you don't need ordering; BST if you need range queries or sorted order.", createdAt: new Date(Date.now() - 36000000).toISOString() },
      { id: "c2f", postId: "qa3", authorId: "me", authorName: "Alex Chen", body: "Follow-up: what about memory? I've heard hash tables can have higher overhead.", createdAt: new Date(Date.now() - 35000000).toISOString(), isFollowUp: true },
    ],
  },
  {
    id: "qa4",
    courseId: "cs101",
    title: "Confused about pointers in C",
    body: "Can someone explain when we use * vs &? I keep mixing them up.",
    authorId: "anon",
    authorName: "Anonymous",
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    upvotes: 15,
    isAnonymous: true,
    comments: [
      { id: "c3", postId: "qa4", authorId: "u2", authorName: "Sam Rivera", body: "& gives you the address of a variable, * dereferences (gets the value at an address). So int* p = &x; means p holds the address of x.", createdAt: new Date(Date.now() - 28000000).toISOString() },
    ],
  },
];
