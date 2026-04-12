import {
  computeGoalProgress,
  pluralizeEntries,
  progressBarColor,
  statusConfig,
} from "@/lib/goal-utils";
import type { GoalResponse } from "@/types/api";
import { Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface GoalCardProps {
  goal: GoalResponse;
}

export function GoalCard({ goal }: GoalCardProps) {
  const config = statusConfig[goal.status] ?? statusConfig.active;
  const progress = computeGoalProgress(goal.startDate, goal.targetDate);
  const categoryColor = goal.categories[0]?.color ?? null;

  return (
    <Link to={`/goals/${goal.id}`} className="group block">
      <div
        className="relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: categoryColor ?? "transparent",
        }}
      >
        <div className="p-5">
          {/* Header: status + title */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    goal.status === "active"
                      ? "bg-emerald-500"
                      : goal.status === "completed"
                        ? "bg-blue-500"
                        : goal.status === "paused"
                          ? "bg-amber-500"
                          : "bg-red-400"
                  }`}
                />
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                {goal.isDefault && (
                  <span className="text-xs text-muted-foreground">
                    (default)
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold leading-snug group-hover:text-primary">
                {goal.title}
              </h3>
            </div>

            {/* Categories on the right */}
            {goal.categories.length > 0 && (
              <div className="flex shrink-0 items-center gap-1.5">
                {goal.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color ?? "#607D8B" }}
                    />
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {goal.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {goal.description}
            </p>
          )}

          {/* Progress bar */}
          {progress && goal.status === "active" && (
            <div className="mt-3 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${progressBarColor(progress)}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress.percent)}%</span>
                <span>
                  {progress.overdue
                    ? `Overdue by ${Math.abs(progress.daysLeft)}d`
                    : `${progress.daysLeft}d left`}
                </span>
              </div>
            </div>
          )}

          {/* Footer: metadata */}
          <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {goal.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(goal.targetDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {pluralizeEntries(goal.entryCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
