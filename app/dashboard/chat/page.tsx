import { Suspense } from "react";
import ChatContent from "./ChatContent";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[20rem] text-[var(--muted)]">Loading chat…</div>}>
      <ChatContent />
    </Suspense>
  );
}
