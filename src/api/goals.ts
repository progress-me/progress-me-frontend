import type {
  CreateGoalRequest,
  GoalResponse,
  UpdateGoalRequest,
  UpdateGoalStatusRequest,
} from "@/types/api";
import client from "./client";

export async function listGoals(params?: {
  status?: string;
  categoryId?: string;
}): Promise<GoalResponse[]> {
  const res = await client.get<GoalResponse[]>("/goals", { params });
  return res.data;
}

export async function getGoal(id: string): Promise<GoalResponse> {
  const res = await client.get<GoalResponse>(`/goals/${id}`);
  return res.data;
}

export async function createGoal(
  data: CreateGoalRequest,
): Promise<GoalResponse> {
  const res = await client.post<GoalResponse>("/goals", data);
  return res.data;
}

export async function updateGoal(
  id: string,
  data: UpdateGoalRequest,
): Promise<GoalResponse> {
  const res = await client.put<GoalResponse>(`/goals/${id}`, data);
  return res.data;
}

export async function updateGoalStatus(
  id: string,
  data: UpdateGoalStatusRequest,
): Promise<GoalResponse> {
  const res = await client.put<GoalResponse>(`/goals/${id}/status`, data);
  return res.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await client.delete(`/goals/${id}`);
}
