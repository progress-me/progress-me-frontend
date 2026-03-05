import { getAiSettings, updateAiSettings } from "@/api/ai-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Settings2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TONES = [
  {
    value: "balanced",
    label: "Balanced",
    desc: "Mix of encouragement and honest feedback",
  },
  {
    value: "gentle",
    label: "Gentle",
    desc: "Encouraging, empathetic, focus on progress",
  },
  {
    value: "strict",
    label: "Strict",
    desc: "Direct, challenging, accountability-focused",
  },
  {
    value: "analytical",
    label: "Analytical",
    desc: "Data-driven, objective observations",
  },
];

export function AiSettingsPage() {
  const queryClient = useQueryClient();
  const [tone, setTone] = useState("balanced");
  const [strictness, setStrictness] = useState(5);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [ignoreAreas, setIgnoreAreas] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [newFocus, setNewFocus] = useState("");
  const [newIgnore, setNewIgnore] = useState("");

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ai-settings"],
    queryFn: getAiSettings,
  });

  useEffect(() => {
    if (settings) {
      setTone(settings.tone);
      setStrictness(settings.strictness);
      setFocusAreas(settings.focusAreas);
      setIgnoreAreas(settings.ignoreAreas);
      setCustomInstructions(settings.customInstructions ?? "");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateAiSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
      toast.success("AI settings updated");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSave = () => {
    mutation.mutate({
      tone,
      strictness,
      focusAreas,
      ignoreAreas,
      customInstructions: customInstructions || null,
    });
  };

  const addFocusArea = () => {
    const trimmed = newFocus.trim();
    if (trimmed && !focusAreas.includes(trimmed)) {
      setFocusAreas([...focusAreas, trimmed]);
      setNewFocus("");
    }
  };

  const addIgnoreArea = () => {
    const trimmed = newIgnore.trim();
    if (trimmed && !ignoreAreas.includes(trimmed)) {
      setIgnoreAreas([...ignoreAreas, trimmed]);
      setNewIgnore("");
    }
  };

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

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Customize how the AI analyzes your progress and communicates with you
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Communication Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label} — {t.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Strictness: {strictness}/10</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[strictness]}
              onValueChange={([v]) => setStrictness(v)}
            />
            <p className="text-xs text-muted-foreground">
              1 = very gentle, 10 = brutally honest
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
          <CardDescription>
            Topics the AI should pay extra attention to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <Badge key={area} variant="secondary" className="gap-1">
                {area}
                <button
                  onClick={() =>
                    setFocusAreas(focusAreas.filter((a) => a !== area))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add focus area..."
              value={newFocus}
              onChange={(e) => setNewFocus(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addFocusArea())
              }
            />
            <Button
              variant="outline"
              onClick={addFocusArea}
              disabled={!newFocus.trim()}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ignore Areas</CardTitle>
          <CardDescription>
            Topics the AI should avoid discussing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ignoreAreas.map((area) => (
              <Badge key={area} variant="outline" className="gap-1">
                {area}
                <button
                  onClick={() =>
                    setIgnoreAreas(ignoreAreas.filter((a) => a !== area))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add ignore area..."
              value={newIgnore}
              onChange={(e) => setNewIgnore(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addIgnoreArea())
              }
            />
            <Button
              variant="outline"
              onClick={addIgnoreArea}
              disabled={!newIgnore.trim()}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Instructions</CardTitle>
          <CardDescription>
            Additional instructions appended to every AI analysis
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

      <Button
        onClick={handleSave}
        disabled={mutation.isPending}
        className="w-full"
      >
        <Save className="mr-1.5 h-4 w-4" />
        {mutation.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
