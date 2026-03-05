import type { PersonaResponse, UpdatePersonaRequest } from "@/types/api";
import client from "./client";

export async function getPersona(): Promise<PersonaResponse> {
  const res = await client.get<PersonaResponse>("/me/persona");
  return res.data;
}

export async function updatePersona(
  data: UpdatePersonaRequest,
): Promise<PersonaResponse> {
  const res = await client.put<PersonaResponse>("/me/persona", data);
  return res.data;
}
