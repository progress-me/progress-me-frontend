import { BarChart3, BookOpen, MessageCircle, Target } from "lucide-react";
import { AuthFeatureCard } from "./AuthFeatureCard";

const features = [
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

export function AuthHero() {
  return (
    <div className="auth-hero-bg relative flex h-full flex-col justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.25_0.04_200)] to-[oklch(0.38_0.08_170)] py-16 pl-8 pr-8 lg:pl-12 lg:pr-12 xl:pl-16 xl:pr-16">
      <div className="relative z-10 w-full">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white xl:text-5xl">
          Progress Me
        </h1>
        <p className="mt-2 text-lg text-white/80 xl:text-xl">
          Your personal growth companion
        </p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/65 xl:text-lg">
          Track your journey, set meaningful goals, and grow with AI-powered
          coaching — all in one place.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 2xl:grid-cols-4 2xl:gap-5">
          {features.map((feature) => (
            <AuthFeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
