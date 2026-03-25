import type { ChatMessageResponse } from "@/types/api";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageBubbleProps {
  message: ChatMessageResponse;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "USER";
  const date = new Date(message.createdAt);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3">
        <MarkdownRenderer content={message.content} />
      </div>
      <span className="text-[10px] text-muted-foreground px-1">{time}</span>
    </div>
  );
}
