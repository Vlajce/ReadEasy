import { apiClient } from "@/lib/api-client";
import type { SubmitExercisesInput } from "@/types/exercise";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSubmitExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitExercisesInput) =>
      apiClient.post<null>("/exercises/submit", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });
}
