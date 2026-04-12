import { listCategories } from "@/api/categories";
import { listGoals } from "@/api/goals";
import { updateLogEntry } from "@/api/log-entries";
import { ENERGY_SCALE, MOOD_SCALE } from "@/components/scale-data";
import { ScaleSelector } from "@/components/ScaleSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  CategoryResponse,
  GoalResponse,
  LogEntryResponse,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface EditEntryDialogProps {
  entry: LogEntryResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

export function EditEntryDialog({
  entry,
  open,
  onOpenChange,
}: EditEntryDialogProps) {
  const { data: goals } = useQuery({
    queryKey: ["goals", "active"],
    queryFn: () => listGoals({ status: "active" }),
    enabled: open,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-baseline gap-3">
            <span>Edit Entry</span>
            <span className="text-xs font-normal text-muted-foreground">
              {new Date(entry.loggedAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {new Date(entry.loggedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </DialogTitle>
        </DialogHeader>
        {open && categories ? (
          <EditEntryForm
            entry={entry}
            goals={goals ?? []}
            categories={categories}
            onOpenChange={onOpenChange}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditEntryForm({
  entry,
  goals,
  categories,
  onOpenChange,
}: {
  entry: LogEntryResponse;
  goals: GoalResponse[];
  categories: CategoryResponse[];
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState(entry.mood ?? 6);
  const [energy, setEnergy] = useState(entry.energy ?? 6);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    entry.goals?.map((g) => g.id) ?? [],
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    entry.categories?.map((c) => c.id) ?? [],
  );

  const effectiveGoalIds = useMemo(() => {
    const ids = new Set(selectedGoalIds);
    if (goals) {
      for (const goal of goals) {
        if (goal.categories.some((c) => selectedCategoryIds.includes(c.id))) {
          ids.add(goal.id);
        }
      }
    }
    return [...ids];
  }, [selectedGoalIds, selectedCategoryIds, goals]);

  const mutation = useMutation({
    mutationFn: () =>
      updateLogEntry(entry.id, {
        content,
        mood,
        energy,
        goalIds: effectiveGoalIds.length > 0 ? effectiveGoalIds : undefined,
        categoryIds:
          selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["log-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry updated");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update entry"),
  });

  function toggleGoal(goalId: string, isDefault: boolean) {
    if (isDefault) return;
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    );
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }

  const nonDefaultGoals = goals?.filter((g) => !g.isDefault) ?? [];
  const defaultGoal = goals?.find((g) => g.isDefault);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6"
    >
      {/* Content */}
      <div>
        <Label htmlFor="edit-entry-content" className="sr-only">
          Content
        </Label>
        <Textarea
          id="edit-entry-content"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="What's on your mind?"
          className="resize-none border-0 bg-muted/30 px-5 py-4 text-[15px] leading-relaxed shadow-none ring-1 ring-border/50 transition-all placeholder:text-muted-foreground/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Categories as pills */}
      {categories && categories.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Focus Areas</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              const color = cat.color ?? "#607D8B";
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all hover:shadow-sm"
                  style={
                    isSelected
                      ? {
                          backgroundColor: color + "18",
                          borderColor: color + "40",
                          color,
                        }
                      : {
                          borderColor: "var(--border)",
                          color: "var(--muted-foreground)",
                        }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full transition-transform"
                    style={{
                      backgroundColor: color,
                      transform: isSelected ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals as pills */}
      {goals && goals.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Goals</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {/* Default goal — always-on pill */}
            {defaultGoal && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 6l3 3 5-5" />
                </svg>
                {defaultGoal.title}
              </span>
            )}

            {/* Toggleable goals */}
            {nonDefaultGoals.map((g) => {
              const isEffective = effectiveGoalIds.includes(g.id);
              const fromCategory = g.categories.some((c) =>
                selectedCategoryIds.includes(c.id),
              );
              const catColor = g.categories[0]?.color ?? "var(--foreground)";
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => !fromCategory && toggleGoal(g.id, false)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all hover:shadow-sm disabled:cursor-default disabled:opacity-70"
                  disabled={fromCategory}
                  style={
                    isEffective
                      ? {
                          backgroundColor:
                            (g.categories[0]?.color ?? "#6366f1") + "18",
                          borderColor:
                            (g.categories[0]?.color ?? "#6366f1") + "40",
                          color: catColor,
                        }
                      : {
                          borderColor: "var(--border)",
                          color: "var(--muted-foreground)",
                        }
                  }
                >
                  {g.title}
                  {fromCategory && (
                    <span className="text-[10px] opacity-60">auto</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t" />

      {/* Mood & Energy */}
      <div className="space-y-6">
        <ScaleSelector
          label="Mood"
          scale={MOOD_SCALE}
          value={mood}
          onChange={setMood}
        />
        <ScaleSelector
          label="Energy Level"
          scale={ENERGY_SCALE}
          value={energy}
          onChange={setEnergy}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || !content.trim() || !categories}
          className="gap-2"
        >
          {mutation.isPending ? (
            "Saving..."
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
