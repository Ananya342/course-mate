"use client";

import type { Message } from "@/lib/types";

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
  senderName?: string;
};

export default function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
  const isSystem = message.senderId === "system";
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-[var(--muted)] bg-[var(--surface)] px-3 py-1.5 rounded-full italic">
          {message.text}
        </span>
      </div>
    );
  }
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-[var(--accent)] text-white rounded-br-md"
            : "bg-[var(--surface-hover)] text-[var(--foreground)] rounded-bl-md"
        }`}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-medium text-[var(--accent)] mb-0.5">{senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        {message.attachment && (
          <div className="mt-2 flex items-center gap-2 text-xs opacity-90">
            <span className="inline-flex items-center gap-1">
              📎 {message.attachment.name}
            </span>
          </div>
        )}
        <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-[var(--muted)]"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
