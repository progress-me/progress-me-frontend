import { Check, X, BookOpen, Target, Calendar, Smile, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionType } from "@/types/api";

interface ProposalCardProps {
  actionType: ActionType;
  actionPayload: Record<string, unknown>;
  onConfirm: () => void;
  onReject: () => void;
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
        <p className="text-sm text-foreground/80 line-clamp-3">{content}</p>
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
        <p className="text-sm text-foreground/80 line-clamp-2">{description}</p>
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

export function ProposalCard({
  actionType,
  actionPayload,
  onConfirm,
  onReject,
  disabled,
}: ProposalCardProps) {
  return (
    <Card className="mt-3 gap-0 py-0 overflow-hidden border-primary/20">
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
      <CardFooter className="gap-2 border-t px-4 py-3">
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
      </CardFooter>
    </Card>
  );
}
