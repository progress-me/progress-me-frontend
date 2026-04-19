import type {
  ChatMessageResponse,
  ChatSessionResponse,
  CreateSessionRequest,
  Page,
  PrebuiltPromptResponse,
  SendMessageRequest,
  StreamCallbacks,
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

export async function sendMessageStream(
  sessionId: string,
  message: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${baseUrl}/chat/sessions/${sessionId}/messages/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
      signal,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith("data:") && currentEvent) {
        const data = JSON.parse(line.slice(5).trim());
        switch (currentEvent) {
          case "status":
            callbacks.onStatus(data.phase);
            break;
          case "token":
            callbacks.onToken(data.text);
            break;
          case "proposal":
            callbacks.onProposal(data);
            break;
          case "done":
            callbacks.onDone(data);
            break;
          case "error":
            callbacks.onError(data.error);
            break;
        }
        currentEvent = "";
      }
    }
  }
}
