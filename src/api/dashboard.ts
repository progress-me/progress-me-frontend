import type { DashboardResponse } from "@/types/api";
import client from "./client";

export async function getDashboard(
  period: number = 30,
): Promise<DashboardResponse> {
  const res = await client.get<DashboardResponse>("/dashboard", {
    params: { period },
  });
  return res.data;
}
