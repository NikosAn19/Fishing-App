// Export all types from their respective files
export * from "./location";
export * from "./fishing";
export * from "./weather";
export * from "./ui";

// Common types that are used across multiple modules
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    units: "metric" | "imperial";
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}
