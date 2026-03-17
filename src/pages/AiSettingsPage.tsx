import {getAiSettings, updateAiSettings} from "@/api/ai-settings";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Slider} from "@/components/ui/slider";
import {Textarea} from "@/components/ui/textarea";
import {getRoleInfo, getStrictnessLabel} from "@/lib/ai-role-utils";
import {cn} from "@/lib/utils";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    BarChart3,
    Heart,
    MessageSquare,
    Save,
    Scale,
    Settings2,
    Target,
    X,
} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

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

    const roleInfo = useMemo(
        () => getRoleInfo(tone, strictness),
        [tone, strictness],
    );
    const sliderLabel = useMemo(
        () => getStrictnessLabel(tone, strictness),
        [tone, strictness],
    );

    const isDirty = useMemo(() => {
        if (!settings) return false;
        return (
            tone !== settings.tone ||
            strictness !== settings.strictness ||
            customInstructions !== (settings.customInstructions ?? "") ||
            JSON.stringify(focusAreas) !== JSON.stringify(settings.focusAreas) ||
            JSON.stringify(ignoreAreas) !== JSON.stringify(settings.ignoreAreas)
        );
    }, [settings, tone, strictness, focusAreas, ignoreAreas, customInstructions]);

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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
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
        <div className="space-y-6 pb-20 md:pb-0">
            <p className="text-muted-foreground">
                Customize how the AI analyzes your progress and communicates with you
            </p>

            {/* Communication Style */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5"/>
                        Communication Style
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tone card grid */}
                    <div className="space-y-2">
                        <Label>Tone</Label>
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
                    </div>

                    {/* Strictness slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Strictness</Label>
                            <span
                                className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {strictness}/10 — {sliderLabel}
              </span>
                        </div>
                        <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[strictness]}
                            onValueChange={([v]) => setStrictness(v)}
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Lenient</span>
                            <span>Moderate</span>
                            <span>Intense</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your AI will act as:{" "}
                            <span className="font-medium text-foreground">
                {roleInfo.role}
              </span>{" "}
                            — {roleInfo.directive}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Content Control */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5"/>
                        Content Control
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                    {/* Focus Areas */}
                    <div className="space-y-3 pb-5">
                        <div>
                            <Label>Focus Areas</Label>
                            <CardDescription className="mt-0.5">
                                Topics the AI should pay extra attention to
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {focusAreas.map((area) => (
                                <Badge key={area} variant="secondary" className="gap-1 py-1">
                                    {area}
                                    <button
                                        aria-label={`Remove ${area}`}
                                        onClick={() =>
                                            setFocusAreas(focusAreas.filter((a) => a !== area))
                                        }
                                    >
                                        <X className="h-3 w-3"/>
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
                    </div>

                    {/* Ignore Areas */}
                    <div className="space-y-3 pt-5">
                        <div>
                            <Label>Ignore Areas</Label>
                            <CardDescription className="mt-0.5">
                                Topics the AI should avoid discussing
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ignoreAreas.map((area) => (
                                <Badge key={area} variant="outline" className="gap-1 py-1">
                                    {area}
                                    <button
                                        aria-label={`Remove ${area}`}
                                        onClick={() =>
                                            setIgnoreAreas(ignoreAreas.filter((a) => a !== area))
                                        }
                                    >
                                        <X className="h-3 w-3"/>
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
                    </div>
                </CardContent>
            </Card>

            {/* Custom Instructions */}
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

            {/* Save button — sticky on mobile */}
            {isDirty && (
                <div className="sticky bottom-16 z-10 md:static md:bottom-auto">
                    <div
                        className="rounded-lg bg-background/80 p-2 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
                        <Button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="w-full"
                        >
                            <Save className="mr-1.5 h-4 w-4"/>
                            {mutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
