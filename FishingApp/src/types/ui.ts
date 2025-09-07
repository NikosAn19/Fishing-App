// UI-related types
export interface MapViewProps {
  onMapPress?: (event: any) => void;
  onMarkerPress?: (marker: any) => void;
}

export interface GlobalHeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export interface BottomMenuProps {
  onMapPress?: () => void;
  onFishPress?: () => void;
  onCatchesPress?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export type MapType = "standard" | "satellite" | "hybrid" | "terrain";

export type ThemeMode = "light" | "dark" | "auto";

export interface AppSettings {
  theme: ThemeMode;
  language: string;
  units: "metric" | "imperial";
  notifications: boolean;
  locationTracking: boolean;
}
