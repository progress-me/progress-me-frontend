import { listLogEntries } from "@/api/log-entries";
import { deleteGoal, getGoal, updateGoalStatus } from "@/api/goals";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GoalStatus } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, FileText, Pencil, Trash2 } from "lucide-react";
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

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!goal) return <p className="text-muted-foreground">Goal not found.</p>;

  const actions = statusActions[goal.status] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/goals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{goal.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{goal.status}</Badge>
            {goal.categories.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1 text-sm text-muted-foreground"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color ?? "#607D8B" }}
                />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
          {!goal.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {goal.description && (
        <p className="text-muted-foreground">{goal.description}</p>
      )}

      <div className="flex gap-4 text-sm text-muted-foreground">
        {goal.startDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Start: {new Date(goal.startDate).toLocaleDateString()}
          </span>
        )}
        {goal.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Target: {new Date(goal.targetDate).toLocaleDateString()}
          </span>
        )}
        {goal.completedAt && (
          <span>
            Completed: {new Date(goal.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {goal.templateType === "smart" && goal.templateData && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">SMART Template</h3>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(goal.templateData).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium capitalize">
                  {key.replace("_", " ")}:
                </span>{" "}
                {value}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Linked Entries ({goal.entryCount})
        </h2>
        {entries?.content.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No entries linked to this goal yet.
          </p>
        )}
        <div className="space-y-2">
          {entries?.content.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{entry.content.slice(0, 100)}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.loggedAt).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="outline">{entry.type}</Badge>
              </CardContent>
            </Card>
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
