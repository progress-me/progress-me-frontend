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
  const selected = scale.find((s) => s.value === value) ?? scale[4];
  const progress = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className="rounded-full px-3 py-1 text-sm font-medium transition-colors"
          style={{ color: selected.color, backgroundColor: selected.bg }}
        >
          {selected.emoji} {selected.label}
        </span>
      </div>

      {/* Gradient track */}
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #14b8a6)",
            }}
          />
        </div>
        <div className="relative flex justify-between">
          {scale.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className="group relative flex h-9 w-9 items-center justify-center"
              >
                <span
                  className="relative z-10 text-lg transition-all duration-200 group-hover:scale-125"
                  style={{
                    filter: isSelected ? "none" : "grayscale(80%)",
                    opacity: isSelected ? 1 : 0.35,
                    transform: isSelected ? "scale(1.35)" : undefined,
                  }}
                >
                  {option.emoji}
                </span>
                {isSelected && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: option.bg }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
