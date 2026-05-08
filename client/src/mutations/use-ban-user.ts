import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useBanUser() {
  return useMutation({
    mutationFn: ({ id }: { id: string; username: string }) =>
      apiClient.patch<null>(`/admin/users/${id}/ban`),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`"${variables.username}" has been banned`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to ban user");
    },
  });
}
