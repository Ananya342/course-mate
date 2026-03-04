"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import MessageBubble from "@/components/MessageBubble";
import { Button, Input } from "@/components/ui";
import { MOCK_USERS, CAMPUS_PEOPLE } from "@/lib/mockData";

export default function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("group");
  const { user, conversations, getMessagesForGroup, addMessage, createDM } = useApp();
  const [input, setInput] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [searchCampus, setSearchCampus] = useState("");
  const [showCampusSearch, setShowCampusSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversationId
    ? conversations.find((c) => c.id === conversationId)
    : conversations[0];
  const messages = activeConv ? getMessagesForGroup(activeConv.id) : [];
  const sortedConvos = [...conversations].sort(
    (a, b) =>
      new Date(b.lastMessageAt ?? b.createdAt).getTime() -
      new Date(a.lastMessageAt ?? a.createdAt).getTime()
  );

  const campusFiltered = searchCampus.trim()
    ? CAMPUS_PEOPLE.filter(
        (p) =>
          p.id !== user.id &&
          (p.name.toLowerCase().includes(searchCampus.toLowerCase()) ||
            p.email.toLowerCase().includes(searchCampus.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const getUserName = (senderId: string) => {
    if (senderId === user.id) return user.name;
    return MOCK_USERS.find((u) => u.id === senderId)?.name ?? CAMPUS_PEOPLE.find((u) => u.id === senderId)?.name ?? "Unknown";
  };

  const handleSend = () => {
    if (!activeConv || !input.trim()) return;
    addMessage(
      activeConv.id,
      input.trim(),
      user.id,
      attachmentName ? { name: attachmentName, type: "file" } : undefined
    );
    setInput("");
    setAttachmentName(null);
  };

  const handleStartDm = (otherUserId: string, otherUserName: string) => {
    const dmId = createDM(otherUserId, otherUserName);
    setShowCampusSearch(false);
    setSearchCampus("");
    router.push(`/dashboard/chat?group=${dmId}`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <aside className="w-72 sm:w-80 flex-shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--surface)]">
        <div className="p-3 border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowCampusSearch((v) => !v)}
            className="w-full rounded-xl bg-[var(--bg)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--muted)] hover:border-[var(--accent)] transition-colors text-left"
          >
            🔍 Search people on campus
          </button>
          {showCampusSearch && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Name or email..."
                value={searchCampus}
                onChange={(e) => setSearchCampus(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] outline-none"
              />
              <ul className="max-h-48 overflow-y-auto space-y-1">
                {campusFiltered.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleStartDm(p.id, p.name)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surface-hover)] flex items-center gap-2"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0">
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      {p.name}
                    </button>
                  </li>
                ))}
                {searchCampus.trim() && campusFiltered.length === 0 && (
                  <li className="text-sm text-[var(--muted)] px-3 py-2">No one found</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-[var(--muted)] uppercase">Conversations</p>
          {sortedConvos.map((c) => {
            const isActive = activeConv?.id === c.id;
            return (
              <a
                key={c.id}
                href={`/dashboard/chat?group=${c.id}`}
                className={`flex items-center gap-3 px-3 py-3 border-l-2 transition-colors ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-transparent hover:bg-[var(--surface-hover)] text-[var(--text)]"
                }`}
              >
                <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {c.type === "dm" ? "💬" : "👥"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {c.type === "dm" ? "Direct message" : "Group"}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="flex-shrink-0 border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-semibold text-[var(--text)]">{activeConv.name}</h2>
              {activeConv.icebreaker && (
                <p className="text-sm text-[var(--muted)] mt-0.5 italic">
                  Icebreaker: {activeConv.icebreaker}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isOwn={m.senderId === user.id}
                  senderName={m.senderId !== user.id ? getUserName(m.senderId) : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 border-t border-[var(--border)] p-3 space-y-2">
              {attachmentName && (
                <div className="flex items-center justify-between text-sm text-[var(--muted)] bg-[var(--bg)] rounded-lg px-3 py-2">
                  <span>📎 {attachmentName}</span>
                  <button type="button" onClick={() => setAttachmentName(null)} className="hover:text-[var(--text)]">
                    Remove
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAttachmentName(`document_${Date.now()}.pdf`)}
                  className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  📎 Attach
                </button>
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!input.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
            <div className="text-center">
              <p className="mb-2">Select a conversation or search for someone on campus.</p>
              <button
                type="button"
                onClick={() => setShowCampusSearch(true)}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Search people
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
