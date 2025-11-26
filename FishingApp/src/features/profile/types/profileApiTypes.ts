import { AuthUser } from "../../auth/types";

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: AuthUser;
}

export interface GetProfileResponse {
  success: boolean;
  user: AuthUser;
}
