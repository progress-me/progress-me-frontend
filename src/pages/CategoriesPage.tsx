import { listCategories } from "@/api/categories";
import { CategoryCard } from "@/components/CategoryCard";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Palette, Plus } from "lucide-react";

export function CategoriesPage({
  showCreate,
  setShowCreate,
}: {
  showCreate: boolean;
  setShowCreate: (open: boolean) => void;
}) {
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
    <div className="space-y-5">
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-destructive/50 p-6 text-destructive">
          <span>Failed to load focus areas.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Palette className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No focus areas yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Focus areas help you organize goals and entries by topic, like
            Health, Career, or Learning.
          </p>
          <Button className="mt-5" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create your first focus area
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {categories?.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      <CreateCategoryDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
