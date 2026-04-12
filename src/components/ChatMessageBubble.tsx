import type { ActionStatus, ChatMessageResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ProposalCard } from "./ProposalCard";

interface ChatMessageBubbleProps {
  message: ChatMessageResponse;
  onSendMessage?: (message: string) => void;
}

const statusBadgeConfig: Record<
  Exclude<ActionStatus, "PROPOSED">,
  { label: string; className: string }
> = {
  EXECUTED: {
    label: "Executed",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-muted text-muted-foreground",
  },
  CONFIRMED: {
    label: "Confirmed",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
};

export function ChatMessageBubble({
  message,
  onSendMessage,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "USER";
  const raw = message.createdAt;
  let time: string | null = null;
  if (raw) {
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

  const isProposal = message.actionStatus === "PROPOSED";
  const hasAction = message.actionStatus && message.actionStatus !== "PROPOSED";
  const badgeConfig = hasAction
    ? statusBadgeConfig[
        message.actionStatus as Exclude<ActionStatus, "PROPOSED">
      ]
    : null;

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 md:max-w-[90%] md:px-4 md:py-3">
        <MarkdownRenderer content={message.content} />
        {isProposal &&
          message.actionType &&
          message.actionPayload &&
          onSendMessage && (
            <ProposalCard
              actionType={message.actionType}
              actionPayload={message.actionPayload}
              onConfirm={() => onSendMessage("confirm")}
              onReject={() => onSendMessage("reject")}
            />
          )}
        {badgeConfig && (
          <div className="mt-2">
            <Badge variant="outline" className={badgeConfig.className}>
              {badgeConfig.label}
            </Badge>
          </div>
        )}
      </div>
      {time && (
        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      )}
    </div>
  );
}
