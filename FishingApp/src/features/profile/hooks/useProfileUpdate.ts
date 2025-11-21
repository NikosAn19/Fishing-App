import { useState, useCallback } from "react";
import { profileApi } from "../api/client";
import { useAuth } from "../../auth/hooks/useAuth";

export function useProfileUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { refreshUser } = useAuth();

  const updateDisplayName = useCallback(
    async (displayName: string): Promise<void> => {
      setUpdating(true);
      setError(null);

      try {
        await profileApi.updateProfile({ displayName });
        await refreshUser(); // Refresh auth store without triggering splash screen
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setUpdating(false);
      }
    },
    [refreshUser]
  );

  return {
    updateDisplayName,
    updating,
    error,
  };
}
