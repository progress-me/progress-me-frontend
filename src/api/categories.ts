import type {
  CategoryResponse,
  CreateCategoryRequest,
  CreateValueRequest,
  UpdateCategoryRequest,
  UpdateValueRequest,
  ValueResponse,
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

export async function createValue(
  categoryId: string,
  data: CreateValueRequest,
): Promise<ValueResponse> {
  const res = await client.post<ValueResponse>(
    `/categories/${categoryId}/values`,
    data,
  );
  return res.data;
}

export async function updateValue(
  id: string,
  data: UpdateValueRequest,
): Promise<ValueResponse> {
  const res = await client.put<ValueResponse>(`/values/${id}`, data);
  return res.data;
}

export async function deleteValue(id: string): Promise<void> {
  await client.delete(`/values/${id}`);
}

export async function listAllValues(): Promise<ValueResponse[]> {
  const res = await client.get<ValueResponse[]>("/values");
  return res.data;
}
