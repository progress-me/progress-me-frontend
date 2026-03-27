export interface ScaleOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

export const MOOD_SCALE: ScaleOption[] = [
  { value: 1, emoji: "😣", label: "Awful", color: "#991b1b", bg: "#fef2f2" },
  { value: 2, emoji: "😞", label: "Bad", color: "#dc2626", bg: "#fee2e2" },
  { value: 3, emoji: "😔", label: "Poor", color: "#ea580c", bg: "#fff7ed" },
  { value: 4, emoji: "😕", label: "Low", color: "#d97706", bg: "#fffbeb" },
  { value: 5, emoji: "😐", label: "Okay", color: "#ca8a04", bg: "#fefce8" },
  { value: 6, emoji: "🙂", label: "Moderate", color: "#65a30d", bg: "#f7fee7" },
  { value: 7, emoji: "😊", label: "Good", color: "#16a34a", bg: "#f0fdf4" },
  { value: 8, emoji: "😁", label: "Great", color: "#059669", bg: "#ecfdf5" },
  { value: 9, emoji: "🤩", label: "Amazing", color: "#0d9488", bg: "#f0fdfa" },
  {
    value: 10,
    emoji: "🥳",
    label: "Excellent",
    color: "#15803d",
    bg: "#dcfce7",
  },
];

export const ENERGY_SCALE: ScaleOption[] = [
  { value: 1, emoji: "😴", label: "Drained", color: "#991b1b", bg: "#fef2f2" },
  {
    value: 2,
    emoji: "🥱",
    label: "Exhausted",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  { value: 3, emoji: "😮‍💨", label: "Tired", color: "#ea580c", bg: "#fff7ed" },
  { value: 4, emoji: "😶", label: "Low", color: "#d97706", bg: "#fffbeb" },
  { value: 5, emoji: "🙂", label: "Okay", color: "#ca8a04", bg: "#fefce8" },
  { value: 6, emoji: "💪", label: "Moderate", color: "#65a30d", bg: "#f7fee7" },
  { value: 7, emoji: "🏃", label: "Active", color: "#16a34a", bg: "#f0fdf4" },
  {
    value: 8,
    emoji: "🔥",
    label: "Energized",
    color: "#059669",
    bg: "#ecfdf5",
  },
  { value: 9, emoji: "⚡", label: "Charged", color: "#0d9488", bg: "#f0fdfa" },
  { value: 10, emoji: "🚀", label: "Peak", color: "#15803d", bg: "#dcfce7" },
];

export function ScaleSelector({
  label,
  scale,
  value,
  onChange,
}: {
  label: string;
  scale: ScaleOption[];
  value: number;
  onChange: (v: number) => void;
}) {
  const selected = scale.find((s) => s.value === value) ?? scale[5];

  return (
    <div className="space-y-2.5 rounded-2xl bg-muted/20 p-4 ring-1 ring-border/30">
      {/* Label + current value */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color: selected.color, backgroundColor: selected.bg }}
        >
          {selected.label}
        </span>
      </div>

      {/* Emoji grid — 2 rows of 5 */}
      <div className="grid grid-cols-5 gap-1.5">
        {scale.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 transition-all duration-150"
              style={{
                opacity: isActive ? 1 : 0.45,
                filter: isActive ? "none" : "grayscale(60%)",
                backgroundColor: isActive ? selected.bg : "transparent",
                boxShadow: isActive
                  ? `0 0 0 1.5px ${selected.color}30`
                  : "none",
              }}
            >
              <span className="text-2xl leading-none">{opt.emoji}</span>
              <span
                className="text-[10px] font-medium leading-none"
                style={{
                  color: isActive ? selected.color : "var(--muted-foreground)",
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
