"use client";

import { useState } from "react";
import type { QAPost as QAPostType } from "@/lib/types";
import { Card, Button, Textarea } from "@/components/ui";

type QAPostCardProps = {
  post: QAPostType;
  currentUserId: string;
  onAddComment: (postId: string, body: string, isInstructor?: boolean, isFollowUp?: boolean) => void;
  onUpvote?: (postId: string) => void;
};

export default function QAPostCard({ post, currentUserId, onAddComment, onUpvote }: QAPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);

  const submitComment = () => {
    if (!comment.trim()) return;
    onAddComment(post.id, comment.trim(), false, isFollowUp);
    setComment("");
    setIsFollowUp(false);
    setExpanded(true);
  };

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {onUpvote && (
          <button
            type="button"
            onClick={() => onUpvote(post.id)}
            className="shrink-0 flex flex-col items-center rounded-lg p-2 hover:bg-[var(--surface-hover)] transition-colors"
            title="Upvote"
          >
            <span className="text-lg">▲</span>
            <span className="text-sm font-semibold text-[var(--text)]">{post.upvotes}</span>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-left w-full group"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {post.title}
              </h3>
              {post.instructorAnswered && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--electric)]/20 text-[var(--electric)] text-xs font-medium">
                  Instructor answered
                </span>
              )}
              {post.endorsedByInstructor && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--mint)]/20 text-[var(--mint)] text-xs font-medium">
                  Endorsed
                </span>
              )}
              {post.isResolved && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--success)]/20 text-[var(--success)] text-xs font-medium">
                  Resolved
                </span>
              )}
              {post.isAnonymous && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--muted)]/20 text-[var(--muted)] text-xs">
                  Anonymous
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--muted)]">
              {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </button>
        </div>
      </div>
      {expanded && (
        <>
          <p className="text-sm text-[var(--text)]/90 whitespace-pre-wrap pl-10">{post.body}</p>
          <div className="border-t border-[var(--border)] pt-3 space-y-3 pl-10">
            <p className="text-xs font-medium text-[var(--muted)]">
              {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
            </p>
            {post.comments.map((c) => (
              <div
                key={c.id}
                className={`pl-3 border-l-2 text-sm ${c.isInstructor ? "border-[var(--electric)]" : c.isFollowUp ? "border-[var(--pink)]" : "border-[var(--border)]"}`}
              >
                <p className="font-medium text-[var(--text)]">
                  {c.authorName}
                  {c.isInstructor && (
                    <span className="ml-2 text-xs text-[var(--electric)]">Instructor</span>
                  )}
                  {c.isFollowUp && (
                    <span className="ml-2 text-xs text-[var(--pink)]">Follow-up</span>
                  )}
                </p>
                <p className="text-[var(--muted)]">{c.body}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={isFollowUp}
                  onChange={(e) => setIsFollowUp(e.target.checked)}
                />
                Post as follow-up
              </label>
              <div className="flex gap-2 flex-wrap">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px] flex-1 min-w-[200px]"
                />
                <Button onClick={submitComment} size="sm" className="self-end">
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
