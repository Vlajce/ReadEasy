import { apiClient } from "@/lib/api-client";
import type {
  SaveVocabularyInput,
  VocabularyEntryDetail,
} from "@/types/vocabulary";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSaveVocabulary() {
  return useMutation({
    mutationFn: (data: SaveVocabularyInput) =>
      apiClient.post<VocabularyEntryDetail>("/vocabulary/save", data),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["vocabulary", "books", variables.bookId, "words"],
      });

      context.client.invalidateQueries({
        queryKey: ["vocabulary", "entries"],
      });

      context.client.invalidateQueries({
        queryKey: ["vocabulary", "stats"],
      });

      toast.success(`"${variables.word}" saved to vocabulary`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to save word to vocabulary");
    },
  });
}
