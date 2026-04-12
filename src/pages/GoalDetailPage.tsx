import { listLogEntries } from "@/api/log-entries";
import { deleteGoal, getGoal, updateGoalStatus } from "@/api/goals";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  computeGoalProgress,
  pluralizeEntries,
  progressBarColor,
  statusConfig,
} from "@/lib/goal-utils";
import type { GoalStatus } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router-dom";

const statusActions: Record<string, { label: string; next: GoalStatus }[]> = {
  active: [
    { label: "Complete", next: "completed" },
    { label: "Pause", next: "paused" },
  ],
  paused: [
    { label: "Resume", next: "active" },
    { label: "Abandon", next: "abandoned" },
  ],
  completed: [{ label: "Reopen", next: "active" }],
  abandoned: [{ label: "Reopen", next: "active" }],
};

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data: goal, isLoading } = useQuery({
    queryKey: ["goals", id],
    queryFn: () => getGoal(id!),
    enabled: !!id,
  });

  const { data: entries } = useQuery({
    queryKey: ["log-entries", "goal", id],
    queryFn: () => listLogEntries({ goalId: id, size: 10 }),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: GoalStatus) => updateGoalStatus(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => toast.error("Failed to update goal status"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGoal(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      navigate("/goals");
    },
    onError: () => toast.error("Failed to delete goal"),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!goal) return <p className="text-muted-foreground">Goal not found.</p>;

  const actions = statusActions[goal.status] ?? [];
  const config = statusConfig[goal.status] ?? statusConfig.active;
  const progress = computeGoalProgress(goal.startDate, goal.targetDate);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link to="/goals">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Goals
        </Button>
      </Link>

      {/* Header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  goal.status === "active"
                    ? "bg-emerald-500"
                    : goal.status === "completed"
                      ? "bg-blue-500"
                      : goal.status === "paused"
                        ? "bg-amber-500"
                        : "bg-red-400"
                }`}
              />
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
              {goal.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#607D8B" }}
                  />
                  {cat.name}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{goal.title}</h1>
            {goal.description && (
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {actions.map(({ label, next }) => (
              <Button
                key={next}
                variant="outline"
                size="sm"
                onClick={() => statusMutation.mutate(next)}
                disabled={statusMutation.isPending}
              >
                {label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            {!goal.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar inside header card */}
        {progress && goal.status === "active" && (
          <div className="mt-5 space-y-1.5 border-t pt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${progressBarColor(progress)}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress.percent)}% complete</span>
              <span>
                {progress.overdue
                  ? `Overdue by ${Math.abs(progress.daysLeft)} days`
                  : `${progress.daysLeft} days remaining`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dates section */}
      {(goal.startDate || goal.targetDate || goal.completedAt) && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Timeline
          </h2>
          <div className="flex flex-wrap gap-6 text-sm">
            {goal.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Start</span>
                  <p className="font-medium">
                    {new Date(goal.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
            {goal.targetDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Target</span>
                  <p className="font-medium">
                    {new Date(goal.targetDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
            {goal.completedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Completed
                  </span>
                  <p className="font-medium">
                    {new Date(goal.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART Template */}
      {goal.templateType === "smart" && goal.templateData && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            SMART Breakdown
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Specific, Measurable, Achievable, Relevant, Time-bound
          </p>
          <div className="space-y-3">
            {Object.entries(goal.templateData).map(([key, value]) => (
              <div key={key} className="border-l-2 border-primary/20 pl-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {key.replace("_", " ")}
                </span>
                <p className="mt-0.5 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Entries */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Linked Entries
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {goal.entryCount > 0
              ? `${pluralizeEntries(goal.entryCount)} connected to this goal.`
              : "Journal entries and notes you connect to this goal will appear here."}
          </p>
        </div>
        {entries?.content.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <FileText className="mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No entries linked yet.
            </p>
          </div>
        )}
        <div className="space-y-2">
          {entries?.content.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {entry.content.slice(0, 100)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.loggedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {entry.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <EditGoalDialog goal={goal} open={showEdit} onOpenChange={setShowEdit} />

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Goal"
        description={`Delete "${goal.title}"? This cannot be undone.`}
      />
    </div>
  );
}
