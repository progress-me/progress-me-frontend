import { getAiSettings, updateAiSettings } from "@/api/ai-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AiSettingsResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Heart, Save, Scale, Settings2, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const TONES = [
  {
    value: "balanced",
    label: "Balanced",
    desc: "Mix of encouragement and honest feedback",
    icon: Scale,
  },
  {
    value: "gentle",
    label: "Gentle",
    desc: "Empathetic and validating — focuses on emotional safety",
    icon: Heart,
  },
  {
    value: "strict",
    label: "Strict",
    desc: "Direct and results-oriented — challenges excuses",
    icon: Target,
  },
  {
    value: "analytical",
    label: "Analytical",
    desc: "Data-driven — focuses on patterns and evidence",
    icon: BarChart3,
  },
];

export function AiSettingsPage() {
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ai-settings"],
    queryFn: getAiSettings,
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
        Failed to load AI settings. Please refresh.
      </p>
    );
  }

  if (!settings) return null;

  return <AiSettingsForm settings={settings} />;
}

function AiSettingsForm({ settings }: { settings: AiSettingsResponse }) {
  const queryClient = useQueryClient();
  const [tone, setTone] = useState(settings.tone);
  const [customInstructions, setCustomInstructions] = useState(
    settings.customInstructions ?? "",
  );

  const isDirty = useMemo(() => {
    return (
      tone !== settings.tone ||
      customInstructions !== (settings.customInstructions ?? "")
    );
  }, [settings, tone, customInstructions]);

  const mutation = useMutation({
    mutationFn: updateAiSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["ai-settings"], data);
      toast.success("AI settings updated");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSave = () => {
    mutation.mutate({
      tone,
      customInstructions: customInstructions || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Communication Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TONES.map((t) => {
              const Icon = t.icon;
              const selected = tone === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/30 hover:bg-accent/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        selected && "text-primary",
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Instructions</CardTitle>
          <CardDescription>
            Additional instructions appended to every AI conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Always suggest actionable next steps. Focus on small wins."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Save button — sticky on mobile */}
      {isDirty && (
        <div className="sticky bottom-16 z-10 md:static md:bottom-auto">
          <div className="rounded-lg bg-background/80 p-2 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="w-full"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {mutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
