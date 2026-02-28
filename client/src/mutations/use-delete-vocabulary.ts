import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteVocabulary() {
  return useMutation({
    mutationFn: ({ id }: { id: string; word: string }) =>
      apiClient.delete<null>(`/vocabulary/${id}`),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["vocabulary"] });
      toast.success(`"${variables.word}" removed from vocabulary`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to remove word");
    },
  });
}