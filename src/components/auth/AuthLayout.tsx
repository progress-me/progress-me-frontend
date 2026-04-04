import type { ReactNode } from "react";
import { BarChart3, BookOpen, MessageCircle, Target } from "lucide-react";
import { AuthHero } from "./AuthHero";

const mobileFeatures = [
  {
    icon: BookOpen,
    title: "Journal & Timeline",
    description: "Log entries with mood and energy tracking",
  },
  {
    icon: Target,
    title: "Goals",
    description: "Set, track, and organize what matters",
  },
  {
    icon: MessageCircle,
    title: "AI Coach",
    description: "Get personalized guidance and insights",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "Streaks, trends, and activity analytics",
  },
];

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Hero panel — desktop only, fills remaining space */}
      <div className="hidden flex-1 md:flex">
        <AuthHero />
      </div>

      {/* Form panel — fixed width, doesn't move */}
      <div className="flex w-full shrink-0 flex-col items-center justify-center px-4 py-8 md:w-[480px] lg:w-[520px]">
        {/* Mobile-only condensed header */}
        <div className="mb-8 text-center md:hidden">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Progress Me
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your personal growth companion
          </p>
        </div>

        <div className="w-full max-w-sm">{children}</div>

        {/* Mobile-only feature explainer */}
        <div className="mt-10 w-full max-w-sm space-y-3 md:hidden">
          <p className="text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
            What you get
          </p>
          {mobileFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--wellness-light)]">
                  <Icon className="h-4 w-4 text-[var(--wellness-dark)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
