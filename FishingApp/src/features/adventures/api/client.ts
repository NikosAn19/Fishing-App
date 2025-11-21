import { API_BASE } from "../../../config/api";
import { apiFetchJson, JSON_HEADERS } from "../../../utils/apiClient";
import {
  Adventure,
  AdventureStatus,
  CreateAdventureRequest,
  UpdateAdventureRequest,
  GetAdventuresResponse,
  GetAdventureResponse,
  CreateAdventureResponse,
  UpdateAdventureResponse,
  DeleteAdventureResponse,
} from "../types/adventure";

const BASE_URL = `${API_BASE}/api/adventures`;

export async function getAdventures(
  status?: AdventureStatus
): Promise<GetAdventuresResponse> {
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL;
  return apiFetchJson<GetAdventuresResponse>(url, {
    method: "GET",
  });
}

export async function getAdventure(id: string): Promise<GetAdventureResponse> {
  return apiFetchJson<GetAdventureResponse>(`${BASE_URL}/${id}`, {
    method: "GET",
  });
}

export async function createAdventure(
  data: CreateAdventureRequest
): Promise<CreateAdventureResponse> {
  return apiFetchJson<CreateAdventureResponse>(BASE_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

export async function updateAdventure(
  id: string,
  data: UpdateAdventureRequest
): Promise<UpdateAdventureResponse> {
  return apiFetchJson<UpdateAdventureResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

export async function deleteAdventure(
  id: string
): Promise<DeleteAdventureResponse> {
  return apiFetchJson<DeleteAdventureResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export const adventuresApi = {
  getAdventures,
  getAdventure,
  createAdventure,
  updateAdventure,
  deleteAdventure,
};
