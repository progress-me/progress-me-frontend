import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api";
import client from "./client";

export async function listCategories(): Promise<CategoryResponse[]> {
  const res = await client.get<CategoryResponse[]>("/categories");
  return res.data;
}

export async function createCategory(
  data: CreateCategoryRequest,
): Promise<CategoryResponse> {
  const res = await client.post<CategoryResponse>("/categories", data);
  return res.data;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest,
): Promise<CategoryResponse> {
  const res = await client.put<CategoryResponse>(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await client.delete(`/categories/${id}`);
}
