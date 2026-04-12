import { deleteCategory } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  return (
    <>
      <Card>
        <div
          className="h-1 rounded-t-lg"
          style={{ backgroundColor: category.color ?? "#607D8B" }}
        />
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <h3 className="font-semibold">{category.name}</h3>
          <div className="ml-auto flex gap-1">
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
        {category.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
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
        description={`Delete "${category.name}"? This cannot be undone.`}
      />
    </>
  );
}
