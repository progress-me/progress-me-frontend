import type { ChatMessageResponse } from "@/types/api";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageBubbleProps {
  message: ChatMessageResponse;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "USER";
  const raw = message.createdAt;
  let time: string | null = null;
  if (raw) {
    // Normalize "2026-03-27 21:45:11.029000 +00:00" → ISO 8601 for Safari compat
    const normalized = raw
      .replace(" ", "T")
      .replace(" +", "+")
      .replace(" -", "-");
    const iso =
      normalized.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(normalized)
        ? normalized
        : normalized + "Z";
    const date = new Date(iso);
    if (!isNaN(date.getTime())) {
      time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground md:max-w-[80%] md:px-4 md:py-2.5">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {time && (
          <span className="text-[10px] text-muted-foreground px-1">{time}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 md:max-w-[90%] md:px-4 md:py-3">
        <MarkdownRenderer content={message.content} />
      </div>
      {time && (
        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      )}
    </div>
  );
}
