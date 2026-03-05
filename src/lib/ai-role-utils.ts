type Tone = "gentle" | "balanced" | "strict" | "analytical";

interface RoleInfo {
  role: string;
  directive: string;
}

const ROLE_MAP: Record<Tone, [RoleInfo, RoleInfo, RoleInfo]> = {
  gentle: [
    {
      role: "Empathetic therapist",
      directive: "Be warm, patient, and validating",
    },
    {
      role: "Supportive counselor",
      directive: "Encourage growth while respecting feelings",
    },
    {
      role: "Caring but firm mentor",
      directive: "Show compassion while holding accountable",
    },
  ],
  balanced: [
    { role: "Friendly mentor", directive: "Be approachable and constructive" },
    {
      role: "Personal growth coach",
      directive: "Balance encouragement with honest feedback",
    },
    {
      role: "Accountability partner",
      directive: "Push for results with mutual respect",
    },
  ],
  strict: [
    { role: "Direct mentor", directive: "Be straightforward and no-nonsense" },
    { role: "Performance coach", directive: "Focus on measurable improvement" },
    {
      role: "Drill-sergeant coach",
      directive: "Challenge excuses and demand excellence",
    },
  ],
  analytical: [
    {
      role: "Curious researcher",
      directive: "Explore patterns with genuine curiosity",
    },
    {
      role: "Data-driven analyst",
      directive: "Focus on evidence and measurable trends",
    },
    {
      role: "Rigorous performance analyst",
      directive: "Demand data-backed conclusions",
    },
  ],
};

function getStrictnessLevel(strictness: number): 0 | 1 | 2 {
  if (strictness <= 4) return 0;
  if (strictness <= 7) return 1;
  return 2;
}

export function getRoleInfo(tone: string, strictness: number): RoleInfo {
  const key = (tone in ROLE_MAP ? tone : "balanced") as Tone;
  return ROLE_MAP[key][getStrictnessLevel(strictness)];
}

export function getStrictnessLabel(tone: string, strictness: number): string {
  const level = getStrictnessLevel(strictness);
  const labels: Record<Tone, [string, string, string]> = {
    gentle: ["Therapist mode", "Supportive guide", "Tough love"],
    balanced: ["Relaxed mentor", "Balanced coach", "High accountability"],
    strict: ["Direct mentor", "Performance driven", "Drill sergeant"],
    analytical: ["Curious observer", "Data focused", "Full rigor"],
  };
  const key = (tone in labels ? tone : "balanced") as Tone;
  return labels[key][level];
}
