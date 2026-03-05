import { deleteCategory, deleteValue } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CategoryResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateValueDialog } from "./CreateValueDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface CategoryCardProps {
  category: CategoryResponse;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddValue, setShowAddValue] = useState(false);
  const [valueToDelete, setValueToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteCatMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const deleteValMutation = useMutation({
    mutationFn: (id: string) => deleteValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to delete value"),
  });

  return (
    <>
      <Card>
        <div
          className="h-1 rounded-t-lg"
          style={{ backgroundColor: category.color ?? "#607D8B" }}
        />
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <h3 className="font-semibold">{category.name}</h3>
          <span className="text-xs text-muted-foreground">
            {category.values.length} value
            {category.values.length !== 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddValue(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add value
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent>
            {category.description && (
              <p className="mb-3 text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
            {category.values.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No values yet. Add your first one!
              </p>
            ) : (
              <div className="space-y-1">
                {category.values.map((value) => (
                  <div
                    key={value.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                  >
                    <div>
                      <span className="text-sm font-medium">{value.name}</span>
                      {value.description && (
                        <p className="text-xs text-muted-foreground">
                          {value.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setValueToDelete(value.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <EditCategoryDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        category={category}
      />
      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={() => deleteCatMutation.mutate()}
        title="Delete Category"
        description={`Delete "${category.name}" and all its values? This cannot be undone.`}
      />
      <CreateValueDialog
        open={showAddValue}
        onOpenChange={setShowAddValue}
        categoryId={category.id}
      />
      <DeleteConfirmDialog
        open={!!valueToDelete}
        onOpenChange={(open) => !open && setValueToDelete(null)}
        onConfirm={() => {
          if (valueToDelete) {
            deleteValMutation.mutate(valueToDelete);
            setValueToDelete(null);
          }
        }}
        title="Delete Value"
        description="Delete this value? This cannot be undone."
      />
    </>
  );
}
