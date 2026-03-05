import { listCategories } from "@/api/categories";
import { listGoals } from "@/api/goals";
import { createLogEntry } from "@/api/log-entries";
import {
  ENERGY_SCALE,
  MOOD_SCALE,
  ScaleSelector,
} from "@/components/ScaleSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeCategoryTagGroups } from "@/lib/entry-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

export function NewEntryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const goalsInitialized = useRef(false);

  const { data: goals } = useQuery({
    queryKey: ["goals", "active"],
    queryFn: () => listGoals({ status: "active" }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  useEffect(() => {
    if (goals && !goalsInitialized.current) {
      goalsInitialized.current = true;
      const defaultGoal = goals.find((g) => g.isDefault);
      if (defaultGoal) {
        setSelectedGoalIds([defaultGoal.id]);
      }
    }
  }, [goals]);

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

  const tagGroups = useMemo(
    () =>
      computeCategoryTagGroups(
        selectedCategoryIds,
        effectiveGoalIds,
        goals ?? [],
        categories ?? [],
      ),
    [selectedCategoryIds, effectiveGoalIds, goals, categories],
  );

  const validSelectedTags = useMemo(() => {
    const availableIds = new Set(
      tagGroups.flatMap((g) => g.values.map((v) => v.id)),
    );
    return selectedTagIds.filter((id) => availableIds.has(id));
  }, [tagGroups, selectedTagIds]);

  const mutation = useMutation({
    mutationFn: createLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["log-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry created");
      navigate("/entries");
    },
    onError: () => toast.error("Failed to create entry"),
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

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      type: "journal",
      content,
      mood,
      energy,
      goalIds: effectiveGoalIds.length > 0 ? effectiveGoalIds : undefined,
      tagValueIds: validSelectedTags.length > 0 ? validSelectedTags : undefined,
    });
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const nonDefaultGoals = goals?.filter((g) => !g.isDefault) ?? [];
  const defaultGoal = goals?.find((g) => g.isDefault);

  return (
    <div className="mx-auto max-w-2xl py-2">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Writing area */}
        <div>
          <Label htmlFor="content" className="sr-only">
            Content
          </Label>
          <Textarea
            id="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="How was your day? What did you accomplish? What's on your mind?"
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

        {/* Tags grouped by category */}
        {tagGroups.length > 0 && (
          <div className="space-y-4">
            <SectionLabel>Values</SectionLabel>
            {tagGroups.map((group) => (
              <div key={group.categoryId} className="space-y-2">
                <div className="flex items-center gap-2">
                  {group.categoryColor && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: group.categoryColor }}
                    />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.categoryName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.values.map((v) => {
                    const isSelected = validSelectedTags.includes(v.id);
                    return (
                      <Badge
                        key={v.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer transition-all hover:shadow-sm"
                        onClick={() => toggleTag(v.id)}
                        style={
                          isSelected && group.categoryColor
                            ? {
                                backgroundColor: group.categoryColor,
                                borderColor: group.categoryColor,
                              }
                            : undefined
                        }
                      >
                        {v.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
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

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full gap-2 text-base"
          disabled={mutation.isPending || !content.trim()}
        >
          {mutation.isPending ? (
            "Creating..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Create Entry
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
