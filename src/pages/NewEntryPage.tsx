import { listCategories } from "@/api/categories";
import { listGoals } from "@/api/goals";
import { createLogEntry, listLogEntries } from "@/api/log-entries";
import { ENERGY_SCALE, MOOD_SCALE } from "@/components/scale-data";
import { ScaleSelector } from "@/components/ScaleSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function NewEntryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const goalsInitialized = useRef(false);
  const moodEnergyInitialized = useRef(false);
  const userTouchedMoodEnergy = useRef(false);

  const { data: goals } = useQuery({
    queryKey: ["goals", "active"],
    queryFn: () => listGoals({ status: "active" }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const todayRange = useMemo(() => {
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const mm = String(Math.abs(offset) % 60).padStart(2, "0");
    const tz = `${sign}${hh}:${mm}`;
    const d = now.toISOString().slice(0, 10);
    return { from: `${d}T00:00:00${tz}`, to: `${d}T23:59:59${tz}` };
  }, []);

  const { data: todayEntries } = useQuery({
    queryKey: ["log-entries", "today-latest", todayRange.from],
    queryFn: () =>
      listLogEntries({ from: todayRange.from, to: todayRange.to, size: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  // Carry forward mood/energy from today's last entry (one-time init from async data)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (
      todayEntries &&
      !moodEnergyInitialized.current &&
      !userTouchedMoodEnergy.current
    ) {
      moodEnergyInitialized.current = true;
      const lastEntry = todayEntries.content[0];
      if (lastEntry) {
        if (lastEntry.mood !== null) setMood(lastEntry.mood);
        if (lastEntry.energy !== null) setEnergy(lastEntry.energy);
      }
    }
  }, [todayEntries]);

  // Select default goal once goals load (one-time init from async data)
  useEffect(() => {
    if (goals && !goalsInitialized.current) {
      goalsInitialized.current = true;
      const defaultGoal = goals.find((g) => g.isDefault);
      if (defaultGoal) {
        setSelectedGoalIds([defaultGoal.id]);
      }
    }
  }, [goals]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    mutationFn: createLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["log-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Entry created");
      navigate("/entries");
    },
    onError: () => toast.error("Failed to create entry"),
  });

  function handleMoodChange(v: number) {
    userTouchedMoodEnergy.current = true;
    setMood(v);
  }

  function handleEnergyChange(v: number) {
    userTouchedMoodEnergy.current = true;
    setEnergy(v);
  }

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      type: "journal",
      content,
      mood,
      energy,
      goalIds: effectiveGoalIds.length > 0 ? effectiveGoalIds : undefined,
      categoryIds:
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            New Entry
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Writing area */}
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/50">
          <Label htmlFor="content" className="sr-only">
            Content
          </Label>
          <Textarea
            id="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="How was your day? What did you accomplish? What's on your mind?"
            className="min-h-[140px] resize-none border-0 bg-transparent px-5 py-4 text-[15px] leading-relaxed shadow-none ring-0 placeholder:text-muted-foreground/40 focus-visible:ring-0"
          />
        </div>

        {/* Focus Areas + Goals grouped card */}
        {((categories && categories.length > 0) ||
          (goals && goals.length > 0)) && (
          <div className="space-y-5 rounded-2xl bg-muted/15 p-5 ring-1 ring-border/25">
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

            {/* Divider between focus areas and goals */}
            {categories &&
              categories.length > 0 &&
              goals &&
              goals.length > 0 && <div className="border-t border-border/30" />}

            {/* Goals as pills */}
            {goals && goals.length > 0 && (
              <div className="space-y-3">
                <SectionLabel>Goals</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {/* Default goal */}
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
                    const catColor =
                      g.categories[0]?.color ?? "var(--foreground)";
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
          </div>
        )}

        {/* Mood & Energy — side by side on desktop */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ScaleSelector
            label="Mood"
            scale={MOOD_SCALE}
            value={mood}
            onChange={handleMoodChange}
          />
          <ScaleSelector
            label="Energy Level"
            scale={ENERGY_SCALE}
            value={energy}
            onChange={handleEnergyChange}
          />
        </div>

        {/* Submit — sticky on mobile */}
        <div className="sticky bottom-[72px] z-10 -mx-4 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-2 pt-8 md:static md:mx-0 md:bg-none md:p-0">
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
        </div>
      </form>
    </div>
  );
}
