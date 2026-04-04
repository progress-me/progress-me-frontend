import type { LucideIcon } from "lucide-react";

interface AuthFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function AuthFeatureCard({
  icon: Icon,
  title,
  description,
}: AuthFeatureCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm xl:p-5">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 xl:h-10 xl:w-10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-1 font-semibold text-white xl:text-lg">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  );
}
