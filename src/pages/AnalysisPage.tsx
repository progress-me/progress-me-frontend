import { analyzeInsight, getPrebuiltPrompts } from "@/api/insights";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { InsightResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AiSettingsPage } from "./AiSettingsPage";
import { InsightsPage } from "./InsightsPage";

function AnalyzeContent() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: prompts } = useQuery({
    queryKey: ["prebuilt-prompts"],
    queryFn: getPrebuiltPrompts,
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeInsight,
    onSuccess: (insight: InsightResponse) => {
      navigate(`/insights/${insight.id}`);
    },
    onError: () => {
      toast.error("Analysis failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    analyzeMutation.mutate({ query: query.trim() });
  };

  const handlePromptClick = (promptQuery: string, type: string) => {
    if (analyzeMutation.isPending) return;
    analyzeMutation.mutate({ query: promptQuery, type });
  };

  if (analyzeMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Analyzing your progress...</p>
        <p className="text-sm text-muted-foreground">
          This may take a few seconds
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ask anything
          </CardTitle>
          <CardDescription>
            The AI has access to your persona, values, goals, and recent entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="How am I doing? What patterns do you see? Am I at risk of burnout?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button type="submit" disabled={!query.trim()}>
              <Send className="mr-1.5 h-4 w-4" />
              Analyze
            </Button>
          </form>
        </CardContent>
      </Card>

      {prompts && prompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick actions
            </CardTitle>
            <CardDescription>
              Pre-built analysis prompts for common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outline"
                  className="h-auto justify-start whitespace-normal py-3 text-left"
                  onClick={() => handlePromptClick(prompt.query, prompt.type)}
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AnalysisPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    (location.state as { tab?: string })?.tab ?? "analyze",
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Analysis</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="analyze" className="mt-4">
          <AnalyzeContent />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <InsightsPage onNavigateToAnalyze={() => setActiveTab("analyze")} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <AiSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
