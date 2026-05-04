import { apiClient } from "@/lib/api-client";
import type { Exercise, GenerateExercisesParams } from "@/types/exercise";
import { useMutation } from "@tanstack/react-query";

export function useGenerateExercises() {
  return useMutation({
    mutationFn: (params: GenerateExercisesParams) => {
      const query = `language=${params.language}&count=${params.count}&types=${params.types.join(",")}&mode=${params.mode}`;
      return apiClient.get<Exercise[]>(`/exercises?${query}`);
    },
  });
}
