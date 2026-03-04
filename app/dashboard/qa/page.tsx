"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Card, Button, Input, Textarea } from "@/components/ui";
import QAPostCard from "@/components/QAPostCard";

type SortOption = "newest" | "active";

function QAContent() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const { user, courses, qaPosts, addQAPost, addQAComment, upvoteQAPost } = useApp();
  const myCourses = courses.filter((c) => user.courses.includes(c.id));
  const defaultCourse = myCourses.some((c) => c.id === courseParam) ? courseParam! : (myCourses[0]?.id ?? "");
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourse);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(false);

  const filteredPosts = useMemo(
    () => qaPosts.filter((p) => p.courseId === selectedCourseId),
    [qaPosts, selectedCourseId]
  );

  const sortedPosts = useMemo(() => {
    const copy = [...filteredPosts];
    if (sort === "newest") {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      copy.sort((a, b) => b.comments.length - a.comments.length);
    }
    return copy;
  }, [filteredPosts, sort]);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !selectedCourseId) return;
    addQAPost(selectedCourseId, title.trim(), body.trim(), postAnonymous);
    setTitle("");
    setBody("");
    setPostAnonymous(false);
    setShowForm(false);
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Course Q&A</h1>
          {selectedCourse && (
            <p className="mt-1.5 text-lg font-medium text-[var(--accent)]">{selectedCourse.code}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-base font-medium text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none"
          >
            {myCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>
          <div className="flex rounded-xl border-2 border-[var(--border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setSort("newest")}
              className={`px-4 py-2.5 text-base font-semibold transition-colors ${sort === "newest" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"}`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSort("active")}
              className={`px-4 py-2.5 text-base font-semibold transition-colors ${sort === "active" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"}`}
            >
              Most Active
            </button>
          </div>
        </div>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} size="lg" className="text-base font-semibold px-6 py-3">
          Create post
        </Button>
      ) : (
        <Card padding="lg">
          <h3 className="font-semibold text-[var(--foreground)] mb-3">New post</h3>
          <form onSubmit={handleSubmitPost} className="space-y-3">
            <Input
              label="Title"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              label="Body"
              placeholder="Your question or note..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={postAnonymous}
                onChange={(e) => setPostAnonymous(e.target.checked)}
              />
              Post anonymously (Piazza-style)
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={!title.trim() || !body.trim()}>
                Post
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sortedPosts.length === 0 ? (
          <Card padding="lg" className="text-center py-10">
            <p className="text-[var(--muted)]">No posts yet. Be the first to ask something.</p>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <QAPostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              onAddComment={addQAComment}
              onUpvote={upvoteQAPost}
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
