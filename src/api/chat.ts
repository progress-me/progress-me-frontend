import type {
  ChatMessageResponse,
  ChatSessionResponse,
  CreateSessionRequest,
  Page,
  PrebuiltPromptResponse,
  SendMessageRequest,
} from "@/types/api";
import client from "./client";

export async function getChatStarters(): Promise<PrebuiltPromptResponse[]> {
  const { data } = await client.get<PrebuiltPromptResponse[]>("/chat/starters");
  return data;
}

export async function createChatSession(
  request: CreateSessionRequest,
): Promise<ChatSessionResponse> {
  const { data } = await client.post<ChatSessionResponse>(
    "/chat/sessions",
    request,
  );
  return data;
}

export async function listChatSessions(
  page = 0,
  size = 10,
): Promise<Page<ChatSessionResponse>> {
  const { data } = await client.get<Page<ChatSessionResponse>>(
    "/chat/sessions",
    { params: { page, size, sort: "updatedAt,desc" } },
  );
  return data;
}

export async function getSessionMessages(
  sessionId: string,
  page = 0,
  size = 50,
): Promise<Page<ChatMessageResponse>> {
  const { data } = await client.get<Page<ChatMessageResponse>>(
    `/chat/sessions/${sessionId}/messages`,
    { params: { page, size } },
  );
  return data;
}

export async function sendMessage(
  sessionId: string,
  request: SendMessageRequest,
): Promise<ChatMessageResponse> {
  const { data } = await client.post<ChatMessageResponse>(
    `/chat/sessions/${sessionId}/messages`,
    request,
  );
  return data;
}
