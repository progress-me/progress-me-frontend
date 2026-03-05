import type {
  AnalyzeRequest,
  InsightResponse,
  Page,
  PrebuiltPromptResponse,
} from "@/types/api";
import client from "./client";

export async function analyzeInsight(
  request: AnalyzeRequest,
): Promise<InsightResponse> {
  const { data } = await client.post<InsightResponse>(
    "/insights/analyze",
    request,
  );
  return data;
}

export async function listInsights(
  page = 0,
  size = 10,
): Promise<Page<InsightResponse>> {
  const { data } = await client.get<Page<InsightResponse>>("/insights", {
    params: { page, size },
  });
  return data;
}

export async function getInsight(id: string): Promise<InsightResponse> {
  const { data } = await client.get<InsightResponse>(`/insights/${id}`);
  return data;
}

export async function getPrebuiltPrompts(): Promise<PrebuiltPromptResponse[]> {
  const { data } =
    await client.get<PrebuiltPromptResponse[]>("/insights/prompts");
  return data;
}
