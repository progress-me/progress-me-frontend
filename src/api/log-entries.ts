import type {
  CreateLogEntryRequest,
  LogEntryResponse,
  Page,
  UpdateLogEntryRequest,
} from "@/types/api";
import client from "./client";

export async function createLogEntry(
  data: CreateLogEntryRequest,
): Promise<LogEntryResponse> {
  const res = await client.post<LogEntryResponse>("/log-entries", data);
  return res.data;
}

export async function listLogEntries(params: {
  type?: string;
  goalId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}): Promise<Page<LogEntryResponse>> {
  const res = await client.get<Page<LogEntryResponse>>("/log-entries", {
    params,
  });
  return res.data;
}

export async function getLogEntry(id: string): Promise<LogEntryResponse> {
  const res = await client.get<LogEntryResponse>(`/log-entries/${id}`);
  return res.data;
}

export async function updateLogEntry(
  id: string,
  data: UpdateLogEntryRequest,
): Promise<LogEntryResponse> {
  const res = await client.put<LogEntryResponse>(`/log-entries/${id}`, data);
  return res.data;
}

export async function deleteLogEntry(id: string): Promise<void> {
  await client.delete(`/log-entries/${id}`);
}
