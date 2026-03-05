import { useAuth } from "@/context/AuthContext";
import { BookOpen, Brain, LogOut, Target, User } from "lucide-react";
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
    label: "AI Analysis",
    icon: Brain,
    paths: ["/analysis", "/insights", "/ai-settings"],
  },
  { to: "/profile", label: "Profile", icon: User, paths: ["/profile"] },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (paths: string[]) =>
    paths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/"),
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/entries" className="text-lg font-semibold">
            Progress Me
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, paths }) => (
              <Link key={to} to={to}>
                <Button
                  variant={isActive(paths) ? "secondary" : "ghost"}
                  size="sm"
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
