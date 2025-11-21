import { useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import { AuthStatus } from "../types";

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const error = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);

  const actions = useMemo(() => {
    const store = useAuthStore.getState();
    return {
      bootstrapSession: store.bootstrapSession,
      refreshUser: store.refreshUser,
      register: store.register,
      login: store.login,
      loginWithGoogle: store.loginWithGoogle,
      logout: store.logout,
      refreshTokens: store.refreshTokens,
      clearError: store.clearError,
    };
  }, []);

  return {
    status,
    user,
    accessToken,
    refreshToken,
    error,
    isLoading,
    ...actions,
    isAuthenticated: status === AuthStatus.AUTHENTICATED,
    isUnauthenticated: status === AuthStatus.UNAUTHENTICATED,
  };
}
