import { apiClient } from "@/lib/api-client";
import { getFormattedDate } from "@/lib/utils";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";
import type { LoginInput } from "@/schemas/user";
import type { User } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginInput) =>
      apiClient.post<User>("/auth/login", credentials),

    onSuccess: async (user) => {
      queryClient.setQueryData(getCurrentUserQueryOptions().queryKey, user);

      toast.success("You have successfully logged in 🎉", {
        description: getFormattedDate() + " 📆",
      });

      navigate({ to: "/explore", replace: true });
    },
  });
}
