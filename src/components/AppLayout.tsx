import { BookOpen, Brain, Target, User } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "./ui/button";

const navItems = [
  { to: "/entries", label: "Timeline", icon: BookOpen, paths: ["/entries"] },
  {
    to: "/goals",
    label: "Goals",
    icon: Target,
    paths: ["/goals", "/categories"],
  },
  {
    to: "/analysis",
    label: "AI",
    icon: Brain,
    paths: ["/analysis", "/insights", "/ai-settings"],
  },
  { to: "/profile", label: "Profile", icon: User, paths: ["/profile"] },
];

export function AppLayout() {
  const location = useLocation();

  const isActive = (paths: string[]) =>
    paths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/"),
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            to="/entries"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Progress Me
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon, paths }) => (
              <Link key={to} to={to}>
                <Button
                  variant={isActive(paths) ? "secondary" : "ghost"}
                  size="sm"
                  className={
                    isActive(paths)
                      ? "bg-[var(--wellness-light)] text-[var(--wellness-dark)] hover:bg-[var(--wellness-light)]"
                      : ""
                  }
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {label === "AI" ? "AI Analysis" : label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-20 md:pb-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Main navigation"
        className="bottom-nav-safe fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {navItems.map(({ to, label, icon: Icon, paths }) => {
            const active = isActive(paths);
            return (
              <Link
                key={to}
                to={to}
                aria-label={label === "AI" ? "AI Analysis" : label}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <div
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                    active
                      ? "bg-[var(--wellness-light)] text-[var(--wellness-dark)] scale-105"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight transition-colors ${
                    active
                      ? "text-[var(--wellness-dark)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
