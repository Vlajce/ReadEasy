import { apiClient } from "@/lib/api-client";
import type {
  SaveVocabularyInput,
  VocabularyEntryDetail,
} from "@/types/vocabulary";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSaveVocabulary() {
  const queryClient = useQueryClient(); // ← ovako se dobija queryClient

  return useMutation({
    mutationFn: (data: SaveVocabularyInput) =>
      apiClient.post<VocabularyEntryDetail>("/vocabulary/save", data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vocabulary", "books", variables.bookId, "words"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vocabulary", "entries"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vocabulary", "stats"],
      });

      toast.success(`"${variables.word}" saved to vocabulary`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to save word to vocabulary");
    },
  });
}
