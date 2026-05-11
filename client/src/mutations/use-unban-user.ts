import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUnbanUser() {
  return useMutation({
    mutationFn: ({ id }: { id: string; username: string }) =>
      apiClient.patch<null>(`/admin/users/${id}/unban`),

    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`"${variables.username}" has been unbanned`);
    },

    onError: (error) => {
      toast.error(error.message || "Failed to unban user");
    },
  });
}
