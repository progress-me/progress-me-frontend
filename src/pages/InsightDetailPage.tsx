import { getInsight } from "@/api/insights";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Brain, Clock, Coins } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export function InsightDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: insight,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["insight", id],
    queryFn: () => getInsight(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Failed to load insight. Please try again.
      </p>
    );
  }

  if (!insight) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Insight not found
      </p>
    );
  }

  const date = new Date(insight.createdAt);

  return (
    <div className="space-y-6">
      <Link
        to="/analysis"
        state={{ tab: "history" }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to insights
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {insight.query}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {date.toLocaleDateString()}{" "}
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {insight.tokensUsed && (
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    {insight.tokensUsed} tokens
                  </span>
                )}
                {insight.contextSummary && (
                  <span className="text-xs">
                    Context: {insight.contextSummary}
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant="secondary">{insight.type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={insight.content} />
        </CardContent>
      </Card>
    </div>
  );
}
