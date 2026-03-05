import type { CategoryResponse, GoalResponse } from "@/types/api";

export interface CategoryTagGroup {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  values: { id: string; name: string }[];
}

export function computeCategoryTagGroups(
  selectedCategoryIds: string[],
  effectiveGoalIds: string[],
  goals: GoalResponse[],
  categories: CategoryResponse[],
): CategoryTagGroup[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const includedCatIds = new Set(selectedCategoryIds);

  for (const gId of effectiveGoalIds) {
    const goal = goals.find((g) => g.id === gId);
    if (goal) {
      for (const gc of goal.categories) {
        includedCatIds.add(gc.id);
      }
    }
  }

  return [...includedCatIds]
    .map((catId) => {
      const cat = categoryMap.get(catId);
      if (!cat || cat.values.length === 0) return null;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        values: cat.values.map((v) => ({ id: v.id, name: v.name })),
      };
    })
    .filter((g): g is CategoryTagGroup => g !== null);
}
