import { listInsights } from "@/api/insights";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface InsightsPageProps {
  onNavigateToAnalyze?: () => void;
}

export function InsightsPage({ onNavigateToAnalyze }: InsightsPageProps) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["insights", page],
    queryFn: () => listInsights(page, 10),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Failed to load insights. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Past AI analyses and recommendations
      </p>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {data && data.content.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Brain className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No insights yet</p>
            {onNavigateToAnalyze ? (
              <Button variant="outline" onClick={onNavigateToAnalyze}>
                Run your first analysis
              </Button>
            ) : (
              <Link to="/analysis">
                <Button variant="outline">Run your first analysis</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {data && data.content.length > 0 && (
        <div className="space-y-3">
          {data.content.map((insight) => {
            const date = new Date(insight.createdAt);
            return (
              <Link key={insight.id} to={`/insights/${insight.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {insight.query}
                      </CardTitle>
                      <Badge variant="secondary">{insight.type}</Badge>
                    </div>
                    <CardDescription>
                      {date.toLocaleDateString()}{" "}
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {insight.contextSummary && ` · ${insight.contextSummary}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {insight.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.number + 1} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
