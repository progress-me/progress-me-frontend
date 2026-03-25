import type { ChatMessageResponse } from "@/types/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";

interface ChatMessageListProps {
  messages: ChatMessageResponse[];
  isPending?: boolean;
}

export function ChatMessageList({
  messages,
  isPending = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isPending]);

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      {isPending && (
        <div className="flex items-start gap-2">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
