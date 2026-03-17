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
import { useAuth } from "@/context/AuthContext";
import type { UpdatePersonaRequest } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LogOut, Pencil, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

const personaFields = [
  { key: "displayName", label: "Display Name", type: "input" },
  { key: "age", label: "Age", type: "number" },
  { key: "bio", label: "Bio", type: "textarea", rows: 3 },
  { key: "strengths", label: "Strengths", type: "textarea", rows: 2 },
  { key: "weaknesses", label: "Weaknesses", type: "textarea", rows: 2 },
  { key: "interests", label: "Interests", type: "textarea", rows: 2 },
  { key: "context", label: "Additional Context", type: "textarea", rows: 3 },
] as const;

export function PersonaPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  function handleCancel() {
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
    setIsEditing(false);
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

  function getFieldValue(key: string): string {
    if (!persona) return "";
    const val = persona[key as keyof typeof persona];
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Account section */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      {/* Persona section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Tell the AI about yourself for better analysis
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isEditing && (
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
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

              {personaFields
                .filter((f) => f.type === "textarea")
                .map(({ key, label, rows }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Textarea
                      id={key}
                      rows={rows}
                      value={
                        (form[key as keyof UpdatePersonaRequest] as string) ??
                        ""
                      }
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Display Name
                  </Label>
                  <p className="mt-0.5 text-sm">
                    {getFieldValue("displayName") || (
                      <span className="italic text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Age</Label>
                  <p className="mt-0.5 text-sm">
                    {getFieldValue("age") || (
                      <span className="italic text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {personaFields
                .filter((f) => f.type === "textarea")
                .map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-muted-foreground text-xs">
                      {label}
                    </Label>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">
                      {getFieldValue(key) || (
                        <span className="italic text-muted-foreground">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
