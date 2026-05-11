import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteAdminUser() {
  return useMutation({
    mutationFn: ({ id }: { id: string; username: string }) =>
      apiClient.delete<null>(`/admin/users/${id}`),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`"${variables.username}" has been deleted`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}
