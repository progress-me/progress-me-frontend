import type { ChatMessageResponse } from "@/types/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { MarkdownRenderer } from "./MarkdownRenderer";

const STATUS_LABELS: Record<string, string> = {
  classifying: "Analyzing your message...",
  thinking: "Thinking...",
};

interface ChatMessageListProps {
  messages: ChatMessageResponse[];
  isPending?: boolean;
  onSendMessage?: (message: string) => void;
  streamingText?: string;
  statusPhase?: string | null;
}

export function ChatMessageList({
  messages,
  isPending = false,
  onSendMessage,
  streamingText,
  statusPhase,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);
  const isStreaming = !!streamingText || !!statusPhase;

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

  // Auto-scroll during streaming
  useEffect(() => {
    if (!isStreaming) return;
    const container = containerRef.current;
    if (!container) return;
    const bottomEl = container.querySelector("[data-bottom-ref]");
    bottomEl?.scrollIntoView({ behavior: "smooth" });
  }, [isStreaming, streamingText]);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {messages.map((message, index) => (
        <div key={message.id} data-message-index={index}>
          <ChatMessageBubble message={message} onSendMessage={onSendMessage} />
        </div>
      ))}
      {statusPhase && !streamingText && (
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {STATUS_LABELS[statusPhase] ?? statusPhase}
            </span>
          </div>
        </div>
      )}
      {streamingText && (
        <div className="flex flex-col items-start gap-1">
          <div className="max-w-[95%] min-w-0 overflow-hidden rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 md:max-w-[90%] md:px-4 md:py-3">
            <MarkdownRenderer content={streamingText} />
          </div>
        </div>
      )}
      {isPending && !isStreaming && (
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
