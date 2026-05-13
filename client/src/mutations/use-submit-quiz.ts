import { apiClient } from "@/lib/api-client";
import type { SubmitQuizInput } from "@/schemas/vocabulary";
import type { SubmitQuizResponse } from "@/types/vocabulary";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitQuizInput) =>
      apiClient.post<SubmitQuizResponse>(
        `/vocabulary/books/${payload.bookId}/quiz/submit`,
        payload,
      ),

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
    },

    onError: (error) => {
      console.error("❌ Quiz submit error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      toast.error(error.message || "Failed to submit quiz answer");
    },
  });
}
