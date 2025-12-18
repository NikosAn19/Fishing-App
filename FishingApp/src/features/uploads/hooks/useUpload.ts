import { useCallback, useState } from "react";
import { uploadImageAndRegister, CompleteRes } from "../../../services/uploads";

type UseUploadResult = {
  upload: (localUri: string) => Promise<CompleteRes>;
  uploading: boolean;
  error: Error | null;
  reset: () => void;
};

export function useImageUpload(): UseUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (localUri: string) => {
    setUploading(true);
    try {
      const result = await uploadImageAndRegister(localUri);
      setError(null);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { upload, uploading, error, reset };
}
