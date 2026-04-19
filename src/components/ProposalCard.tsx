import {
  Check,
  X,
  BookOpen,
  Target,
  Calendar,
  Smile,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionStatus, ActionType } from "@/types/api";

interface ProposalCardProps {
  actionType: ActionType;
  actionPayload: Record<string, unknown>;
  status?: ActionStatus;
  onConfirm?: () => void;
  onReject?: () => void;
  disabled?: boolean;
}

function DailyNotePreview({ payload }: { payload: Record<string, unknown> }) {
  const action = payload.action as string;
  const content = payload.content as string | undefined;
  const mood = payload.mood as number | undefined;
  const energy = payload.energy as number | undefined;
  const categoryIds = payload.categoryIds as string[] | undefined;

  return (
    <div className="space-y-2">
      <Badge variant="secondary" className="text-xs">
        <BookOpen className="h-3 w-3" />
        {action === "UPDATE" ? "Update Entry" : "New Entry"}
      </Badge>
      {content && (
        <p className="whitespace-pre-wrap text-sm text-foreground/80">
          {content}
        </p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {mood != null && (
          <span className="flex items-center gap-1">
            <Smile className="h-3.5 w-3.5" /> Mood: {mood}/10
          </span>
        )}
        {energy != null && (
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> Energy: {energy}/10
          </span>
        )}
        {categoryIds && categoryIds.length > 0 && (
          <span>
            {categoryIds.length}{" "}
            {categoryIds.length === 1 ? "category" : "categories"}
          </span>
        )}
      </div>
    </div>
  );
}

function GoalPreview({ payload }: { payload: Record<string, unknown> }) {
  const action = payload.action as string;
  const title = payload.title as string | undefined;
  const description = payload.description as string | undefined;
  const targetDate = payload.targetDate as string | undefined;

  const actionLabels: Record<string, string> = {
    CREATE: "Create Goal",
    UPDATE: "Update Goal",
    PAUSE: "Pause Goal",
    COMPLETE: "Complete Goal",
  };

  return (
    <div className="space-y-2">
      <Badge variant="secondary" className="text-xs">
        <Target className="h-3 w-3" />
        {actionLabels[action] ?? action}
      </Badge>
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      {description && (
        <p className="whitespace-pre-wrap text-sm text-foreground/80">
          {description}
        </p>
      )}
      {targetDate && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Target: {new Date(targetDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

const resolvedConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  EXECUTED: {
    label: "Saved",
    icon: CheckCircle2,
    className: "text-green-600 dark:text-green-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "text-yellow-600 dark:text-yellow-400",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "text-muted-foreground",
  },
};

export function ProposalCard({
  actionType,
  actionPayload,
  status = "PROPOSED",
  onConfirm,
  onReject,
  disabled,
}: ProposalCardProps) {
  const isResolved = status !== "PROPOSED";
  const resolved = isResolved ? resolvedConfig[status] : null;

  return (
    <Card
      className={`mt-3 gap-0 py-0 overflow-hidden ${isResolved ? "border-border/40 opacity-80" : "border-primary/20"}`}
    >
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm">Proposed Action</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {actionType === "DAILY_NOTE" ? (
          <DailyNotePreview payload={actionPayload} />
        ) : (
          <GoalPreview payload={actionPayload} />
        )}
      </CardContent>
      <CardFooter className="border-t px-4 py-3">
        {resolved ? (
          <div
            className={`flex w-full items-center justify-center gap-1.5 text-sm font-medium ${resolved.className}`}
          >
            <resolved.icon className="h-4 w-4" />
            {resolved.label}
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2">
            <Button size="sm" onClick={onConfirm} disabled={disabled}>
              <Check className="h-4 w-4" />
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
