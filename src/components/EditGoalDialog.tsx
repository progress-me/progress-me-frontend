import { listCategories } from "@/api/categories";
import { updateGoal } from "@/api/goals";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoalResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditGoalDialogProps {
  goal: GoalResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_SMART = {
  specific: "",
  measurable: "",
  achievable: "",
  relevant: "",
  time_bound: "",
};

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [useSmart, setUseSmart] = useState(false);
  const [smart, setSmart] = useState(EMPTY_SMART);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setTitle(goal.title);
      setDescription(goal.description ?? "");
      setCategoryIds(goal.categories.map((c) => c.id));
      setStartDate(goal.startDate?.slice(0, 10) ?? "");
      setTargetDate(goal.targetDate?.slice(0, 10) ?? "");
      const hasSmart = goal.templateType === "smart" && goal.templateData;
      setUseSmart(!!hasSmart);
      setSmart(
        hasSmart ? { ...EMPTY_SMART, ...goal.templateData } : EMPTY_SMART,
      );
    }
  }, [open, goal]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const mutation = useMutation({
    mutationFn: () =>
      updateGoal(goal.id, {
        title,
        description: description || null,
        categoryIds: categoryIds.length > 0 ? categoryIds : null,
        startDate: startDate || null,
        targetDate: targetDate || null,
        templateType: useSmart ? "smart" : null,
        templateData: useSmart ? smart : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update goal"),
  });

  function toggleCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-goal-title">Title</Label>
            <Input
              id="edit-goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal-desc">Description</Label>
            <Textarea
              id="edit-goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {categories && categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="space-y-2 rounded-md border p-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-cat-${cat.id}`}
                      checked={categoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <Label
                      htmlFor={`edit-cat-${cat.id}`}
                      className="flex cursor-pointer items-center gap-1.5 text-sm font-normal"
                    >
                      {cat.color && (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      {cat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-start">Start Date</Label>
              <Input
                id="edit-goal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-goal-target">Target Date</Label>
              <Input
                id="edit-goal-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-use-smart"
              checked={useSmart}
              onChange={(e) => setUseSmart(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="edit-use-smart">Use SMART template</Label>
          </div>

          {useSmart && (
            <div className="space-y-3 rounded-md border p-3">
              {(
                [
                  "specific",
                  "measurable",
                  "achievable",
                  "relevant",
                  "time_bound",
                ] as const
              ).map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs capitalize">
                    {field.replace("_", " ")}
                  </Label>
                  <Textarea
                    value={smart[field]}
                    onChange={(e) =>
                      setSmart({ ...smart, [field]: e.target.value })
                    }
                    rows={1}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
