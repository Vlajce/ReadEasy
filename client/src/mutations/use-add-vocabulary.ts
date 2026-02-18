import { apiClient } from "@/lib/api-client";
import type {
  CreateVocabularyInput,
  VocabularyEntryDetail,
} from "@/types/vocabulary";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddVocabulary() {
  return useMutation({
    mutationFn: (data: CreateVocabularyInput) =>
      apiClient.post<VocabularyEntryDetail>("/vocabulary", data),

    onSuccess: (_data, variables, _context, context) => {
      // Invalidate the book vocabulary words so highlights update
      context.client.invalidateQueries({
        queryKey: ["vocabulary", "books", variables.bookId, "words"],
      });
      toast.success(`"${variables.word}" added to vocabulary`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to add word to vocabulary");
    },
  });
}
