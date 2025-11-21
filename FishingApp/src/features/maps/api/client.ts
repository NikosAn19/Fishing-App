import { API_BASE } from "../../../config/api";
import { apiFetchJson, JSON_HEADERS } from "../../../utils/apiClient";
import {
  FavoriteSpot,
  CreateFavoriteSpotRequest,
  GetFavoriteSpotsResponse,
  CreateFavoriteSpotResponse,
  DeleteFavoriteSpotResponse,
} from "./types";

const BASE_URL = `${API_BASE}/api/favorite-spots`;

export async function getFavoriteSpots(): Promise<GetFavoriteSpotsResponse> {
  return apiFetchJson<GetFavoriteSpotsResponse>(BASE_URL, {
    method: "GET",
  });
}

export async function addFavoriteSpot(
  data: CreateFavoriteSpotRequest
): Promise<CreateFavoriteSpotResponse> {
  return apiFetchJson<CreateFavoriteSpotResponse>(BASE_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

export async function deleteFavoriteSpot(
  id: string
): Promise<DeleteFavoriteSpotResponse> {
  return apiFetchJson<DeleteFavoriteSpotResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
