import { apiClient } from "@/lib/api-client";
import type {
  VocabularyEntryDetail,
  VocabularyStatus,
} from "@/types/vocabulary";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateVocabularyStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VocabularyStatus }) =>
      apiClient.put<VocabularyEntryDetail>(`/vocabulary/${id}`, { status }),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["vocabulary"] });
      toast.success(`Word moved to "${variables.status}"`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}