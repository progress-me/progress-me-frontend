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
