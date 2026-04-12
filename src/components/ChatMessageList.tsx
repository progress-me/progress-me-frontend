import type { ChatMessageResponse } from "@/types/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";

interface ChatMessageListProps {
  messages: ChatMessageResponse[];
  isPending?: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatMessageList({
  messages,
  isPending = false,
  onSendMessage,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevCount = prevCountRef.current;
    prevCountRef.current = messages.length;

    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // When AI response arrives, scroll to its start with ~80px context above
    if (messages.length > prevCount && lastMessage.role === "ASSISTANT") {
      const lastEl = container.querySelector<HTMLElement>(
        `[data-message-index="${messages.length - 1}"]`,
      );
      if (lastEl) {
        const scrollParent = container.closest<HTMLElement>(
          "[class*='overflow-y-auto']",
        );
        if (scrollParent) {
          const containerRect = scrollParent.getBoundingClientRect();
          const elRect = lastEl.getBoundingClientRect();
          const offset =
            scrollParent.scrollTop + (elRect.top - containerRect.top) - 80;
          scrollParent.scrollTo({ top: offset, behavior: "smooth" });
          return;
        }
      }
    }

    // For user messages or pending state, scroll to bottom
    if (
      isPending ||
      (messages.length > prevCount && lastMessage.role === "USER")
    ) {
      const bottomEl = container.querySelector("[data-bottom-ref]");
      bottomEl?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {messages.map((message, index) => (
        <div key={message.id} data-message-index={index}>
          <ChatMessageBubble message={message} onSendMessage={onSendMessage} />
        </div>
      ))}
      {isPending && (
        <div className="flex items-start gap-2">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
      <div data-bottom-ref />
    </div>
  );
}
