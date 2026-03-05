import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GoalResponse } from "@/types/api";
import { Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" },
  abandoned: { label: "Abandoned", variant: "destructive" },
};

interface GoalCardProps {
  goal: GoalResponse;
}

export function GoalCard({ goal }: GoalCardProps) {
  const config = statusConfig[goal.status] ?? statusConfig.active;

  return (
    <Link to={`/goals/${goal.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <Badge variant={config.variant}>{config.label}</Badge>
          <h3 className="font-semibold">
            {goal.title}
            {goal.isDefault && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (default)
              </span>
            )}
          </h3>
          {goal.categories.length > 0 && (
            <div className="flex items-center gap-2">
              {goal.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#607D8B" }}
                  />
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {goal.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {goal.entryCount} entries
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
