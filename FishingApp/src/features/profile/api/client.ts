import { API_BASE } from "../../../config/api";
import { apiFetchJson, JSON_HEADERS } from "../../../utils/apiClient";
import {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types/profileApiTypes";

const BASE_URL = `${API_BASE}/api/users`;

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  return apiFetchJson<UpdateProfileResponse>(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

export async function getProfile(): Promise<GetProfileResponse> {
  return apiFetchJson<GetProfileResponse>(`${BASE_URL}/profile`, {
    method: "GET",
  });
}

export const profileApi = {
  updateProfile,
  getProfile,
};
