import { getPersona, updatePersona } from "@/api/persona";
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
import { Textarea } from "@/components/ui/textarea";
import type { UpdatePersonaRequest } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

export function PersonaPage() {
  const queryClient = useQueryClient();

  const {
    data: persona,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["persona"],
    queryFn: getPersona,
  });

  const [form, setForm] = useState<UpdatePersonaRequest>({});

  useEffect(() => {
    if (persona) {
      setForm({
        displayName: persona.displayName ?? "",
        age: persona.age,
        bio: persona.bio ?? "",
        strengths: persona.strengths ?? "",
        weaknesses: persona.weaknesses ?? "",
        interests: persona.interests ?? "",
        context: persona.context ?? "",
      });
    }
  }, [persona]);

  const mutation = useMutation({
    mutationFn: updatePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persona"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load profile.</span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Tell the AI about yourself for better analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={form.displayName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={150}
                value={form.age ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    age: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A short description about yourself"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              rows={2}
              value={form.strengths ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, strengths: e.target.value }))
              }
              placeholder="What are you good at?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weaknesses">Weaknesses</Label>
            <Textarea
              id="weaknesses"
              rows={2}
              value={form.weaknesses ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, weaknesses: e.target.value }))
              }
              placeholder="What do you struggle with?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Textarea
              id="interests"
              rows={2}
              value={form.interests ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, interests: e.target.value }))
              }
              placeholder="What are you interested in?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Textarea
              id="context"
              rows={3}
              value={form.context ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, context: e.target.value }))
              }
              placeholder="Anything else the AI should know about you"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!persona || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
