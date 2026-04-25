import { apiClient } from "@/lib/api-client";
import type { TranslationResult } from "@/types/vocabulary";
import { useMutation } from "@tanstack/react-query";

export function useTranslate() {
  return useMutation({
    mutationFn: (data: { word: string; sentence: string; bookId: string }) =>
      apiClient.post<TranslationResult>("/translation", data),
  });
}
