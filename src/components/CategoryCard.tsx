import { deleteCategory } from "@/api/categories";
import { Button } from "@/components/ui/button";
import type { CategoryResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface CategoryCardProps {
  category: CategoryResponse;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteCatMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const color = category.color ?? "#607D8B";

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
        style={{ borderLeftWidth: "3px", borderLeftColor: color }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h3 className="text-base font-semibold">{category.name}</h3>
              </div>
              {category.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowEdit(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditCategoryDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        category={category}
      />
      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={() => deleteCatMutation.mutate()}
        title="Delete Focus Area"
        description={`Delete "${category.name}"? This cannot be undone.`}
      />
    </>
  );
}
