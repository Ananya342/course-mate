"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Card, Button, Input, Textarea } from "@/components/ui";
import QAPostCard from "@/components/QAPostCard";
import { resolveEnrolledCourses } from "@/lib/coursesDisplay";
import { parseTagsInput, SUGGESTED_QA_TAGS, postMatchesSearch } from "@/lib/qaTags";

type SortOption = "newest" | "active";

function QAContent() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const { user, courses, qaPosts, addQAPost, addQAComment, upvoteQAPost } = useApp();

  const enrolled = useMemo(() => resolveEnrolledCourses(user, courses), [user, courses]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [postError, setPostError] = useState("");

  useEffect(() => {
    if (enrolled.length === 0) {
      setSelectedCourseId("");
      return;
    }
    setSelectedCourseId((prev) => {
      if (prev && enrolled.some((c) => c.id === prev)) return prev;
      if (courseParam && enrolled.some((c) => c.id === courseParam)) return courseParam;
      return enrolled[0].id;
    });
  }, [enrolled, courseParam]);

  const filteredPosts = useMemo(() => {
    return qaPosts.filter(
      (p) =>
        p.courseId === selectedCourseId && postMatchesSearch(p, searchQuery)
    );
  }, [qaPosts, selectedCourseId, searchQuery]);

  const sortedPosts = useMemo(() => {
    const copy = [...filteredPosts];
    if (sort === "newest") {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      copy.sort((a, b) => b.comments.length - a.comments.length);
    }
    return copy;
  }, [filteredPosts, sort]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError("");
    if (!title.trim() || !body.trim()) return;
    if (!selectedCourseId) {
      setPostError("Add at least one course to your profile before posting.");
      return;
    }
    const tags = parseTagsInput(tagsInput);
    const ok = await addQAPost(selectedCourseId, title.trim(), body.trim(), postAnonymous, tags);
    if (!ok) {
      setPostError("Could not post. If you use Supabase, run the latest SQL migration for Q&A tags, then try again.");
      return;
    }
    setTitle("");
    setBody("");
    setTagsInput("");
    setPostAnonymous(false);
    setShowForm(false);
  };

  const appendSuggestedTag = (tag: string) => {
    const current = tagsInput.trim();
    const parsed = parseTagsInput(current);
    if (parsed.includes(tag)) return;
    const next = [...parsed, tag].join(", ");
    setTagsInput(next);
  };

  const selectedCourse = enrolled.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6 w-full max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Course Q&amp;A</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Piazza-style threads — search by keyword or tag (project, hackathon, exam, …).
          </p>
          {selectedCourse && (
            <p className="mt-2 text-lg font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--pink)] bg-clip-text text-transparent">
              {selectedCourse.code} · {selectedCourse.name}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-3 min-w-0 lg:max-w-md w-full">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={enrolled.length === 0}
            className="rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-base font-medium text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none min-w-[10rem]"
          >
            {enrolled.length === 0 ? (
              <option value="">No courses — add in profile</option>
            ) : (
              enrolled.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))
            )}
          </select>
          <div className="flex rounded-xl border-2 border-[var(--border)] overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setSort("newest")}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${sort === "newest" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"}`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSort("active")}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${sort === "active" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"}`}
            >
              Most active
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          label=""
          placeholder="Search posts, topics, tags…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-0"
          aria-label="Search Q&A"
        />
        {searchQuery && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setSearchQuery("")} className="shrink-0">
            Clear search
          </Button>
        )}
      </div>

      {enrolled.length === 0 && (
        <Card padding="lg" className="border-[var(--accent)]/30 bg-[var(--accent)]/5">
          <p className="text-[var(--text)] font-medium">
            You don&apos;t have any courses on your profile yet, so you can&apos;t pick a class for Q&amp;A.
          </p>
          <p className="text-sm text-[var(--muted)] mt-2">
            Add courses in onboarding or under{" "}
            <Link href="/dashboard/profile" className="text-[var(--accent)] font-semibold hover:underline">
              Your profile
            </Link>
            .
          </p>
        </Card>
      )}

      {!showForm ? (
        <Button
          onClick={() => {
            setPostError("");
            setShowForm(true);
          }}
          size="lg"
          className="text-base font-semibold px-6 py-3 gradient-bg border-0 text-white"
          disabled={enrolled.length === 0}
        >
          Create post
        </Button>
      ) : (
        <Card padding="lg" className="border-[var(--accent)]/25 shadow-lg shadow-[var(--accent)]/10">
          <h3 className="font-bold text-lg text-[var(--foreground)] mb-1">New post</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Tags help classmates find this under topics like <em>hackathon</em>, <em>project-2</em>, or <em>midterm</em>.
          </p>
          {postError && <p className="mb-3 text-sm text-red-500 font-medium">{postError}</p>}
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Clarification on project milestone 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              label="Body"
              placeholder="Your question or note…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
            />
            <div>
              <Input
                label="Tags"
                placeholder="project, hackathon, homework-3 (comma-separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <p className="text-xs text-[var(--muted)] mt-1.5">Letters, numbers, and hyphens. Up to 12 tags.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-semibold text-[var(--muted)] self-center mr-1">Quick add:</span>
                {SUGGESTED_QA_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => appendSuggestedTag(t)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--accent)] font-medium hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 transition-colors"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={postAnonymous}
                onChange={(e) => setPostAnonymous(e.target.checked)}
              />
              Post anonymously (Piazza-style)
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!title.trim() || !body.trim() || !selectedCourseId} className="gradient-bg border-0 text-white font-bold">
                Post
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setPostError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sortedPosts.length === 0 ? (
          <Card padding="lg" className="text-center py-10">
            <p className="text-[var(--muted)]">
              {searchQuery.trim()
                ? "No posts match your search. Try another keyword or tag."
                : "No posts yet in this course. Be the first to ask something."}
            </p>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <QAPostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              onAddComment={addQAComment}
              onUpvote={upvoteQAPost}
              onTagClick={(tag) => setSearchQuery(tag)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function QAPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[20rem] text-[var(--muted)]">Loading…</div>}>
      <QAContent />
    </Suspense>
  );
}
