import { listCategories } from "@/api/categories";
import { CategoryCard } from "@/components/CategoryCard";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";

export function CategoriesPage() {
  const [showCreate, setShowCreate] = useState(false);

  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Category
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load categories.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories?.length === 0 && (
        <p className="text-muted-foreground">
          No categories yet. Create your first one to organize your values!
        </p>
      )}

      {categories?.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}

      <CreateCategoryDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
