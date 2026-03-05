import type { AiSettingsResponse, UpdateAiSettingsRequest } from "@/types/api";
import client from "./client";

export async function getAiSettings(): Promise<AiSettingsResponse> {
  const { data } = await client.get<AiSettingsResponse>("/me/ai-settings");
  return data;
}

export async function updateAiSettings(
  request: UpdateAiSettingsRequest,
): Promise<AiSettingsResponse> {
  const { data } = await client.put<AiSettingsResponse>(
    "/me/ai-settings",
    request,
  );
  return data;
}
