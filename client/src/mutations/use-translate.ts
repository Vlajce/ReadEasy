import { apiClient } from "@/lib/api-client";
import type { TranslationResult } from "@/types/vocabulary";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useTranslate() {
  return useMutation({
    mutationFn: (data: { word: string; sentence: string; bookId: string }) =>
      apiClient.post<TranslationResult>("/translation", data),

    onError: (error) => {
      toast.error(error.message || "Failed to translate word");
    },
  });
}
