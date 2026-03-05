import type { CategoryResponse, GoalResponse } from "@/types/api";
import { describe, expect, it } from "vitest";
import { computeCategoryTagGroups } from "./entry-utils";

const makeCategory = (
  id: string,
  name: string,
  values: { id: string; name: string }[] = [],
  color: string | null = null,
): CategoryResponse =>
  ({
    id,
    name,
    color,
    values: values.map((v, i) => ({
      ...v,
      categoryId: id,
      description: null,
      sortOrder: i,
      createdAt: "",
    })),
  }) as CategoryResponse;

const makeGoal = (id: string, categoryIds: string[]): GoalResponse =>
  ({
    id,
    title: `Goal ${id}`,
    categories: categoryIds.map((cid) => ({ id: cid, name: cid, color: null })),
  }) as GoalResponse;

describe("computeCategoryTagGroups", () => {
  const categories = [
    makeCategory("c1", "Mood", [
      { id: "v1", name: "Happy" },
      { id: "v2", name: "Sad" },
    ]),
    makeCategory("c2", "Energy", [{ id: "v3", name: "High" }]),
    makeCategory("c3", "Empty", []),
  ];

  it("returns groups for selected categories", () => {
    const result = computeCategoryTagGroups(["c1"], [], [], categories);

    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("c1");
    expect(result[0].categoryName).toBe("Mood");
    expect(result[0].values).toEqual([
      { id: "v1", name: "Happy" },
      { id: "v2", name: "Sad" },
    ]);
  });

  it("includes categories from goals", () => {
    const goals = [makeGoal("g1", ["c2"])];
    const result = computeCategoryTagGroups([], ["g1"], goals, categories);

    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("c2");
  });

  it("merges selected and goal categories without duplicates", () => {
    const goals = [makeGoal("g1", ["c1"])];
    const result = computeCategoryTagGroups(
      ["c1", "c2"],
      ["g1"],
      goals,
      categories,
    );

    expect(result).toHaveLength(2);
    const ids = result.map((g) => g.categoryId);
    expect(ids).toContain("c1");
    expect(ids).toContain("c2");
  });

  it("filters out categories with no values", () => {
    const result = computeCategoryTagGroups(["c3"], [], [], categories);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when no categories match", () => {
    const result = computeCategoryTagGroups(["unknown"], [], [], categories);
    expect(result).toHaveLength(0);
  });

  it("handles empty inputs", () => {
    const result = computeCategoryTagGroups([], [], [], []);
    expect(result).toHaveLength(0);
  });

  it("ignores goals that don't exist in the goals array", () => {
    const result = computeCategoryTagGroups(
      [],
      ["nonexistent"],
      [],
      categories,
    );
    expect(result).toHaveLength(0);
  });
});
