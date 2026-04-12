export const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    color: string;
  }
> = {
  active: { label: "Active", variant: "default", color: "text-emerald-600" },
  completed: {
    label: "Completed",
    variant: "secondary",
    color: "text-blue-600",
  },
  paused: { label: "Paused", variant: "outline", color: "text-amber-600" },
  abandoned: {
    label: "Abandoned",
    variant: "destructive",
    color: "text-red-500",
  },
};

export function computeGoalProgress(
  startDate: string | null,
  targetDate: string | null,
): { percent: number; daysLeft: number; overdue: boolean } | null {
  if (!startDate || !targetDate) return null;

  const start = new Date(startDate).getTime();
  const target = new Date(targetDate).getTime();
  const now = Date.now();

  if (target <= start) return null;

  const total = target - start;
  const elapsed = now - start;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  return { percent, daysLeft, overdue: daysLeft < 0 };
}

export function progressBarColor(progress: {
  percent: number;
  daysLeft: number;
  overdue: boolean;
}): string {
  if (progress.overdue) return "bg-red-500";
  if (progress.daysLeft <= 7) return "bg-amber-500";
  return "bg-emerald-500";
}

export function pluralizeEntries(count: number): string {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}

export const smartPlaceholders: Record<string, string> = {
  specific: "What exactly do you want to accomplish?",
  measurable: "How will you measure your progress?",
  achievable: "Is this goal realistic with your resources?",
  relevant: "Why does this goal matter to you right now?",
  time_bound: "What is your deadline or timeframe?",
};
