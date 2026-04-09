import { apiClient } from "@/lib/api-client";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";
import { getLanguageName } from "@/lib/languages";
import type { User } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateNativeLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nativeLanguage: string) =>
      apiClient.put<User>("/users/me", { nativeLanguage }),

    onSuccess: (user) => {
      queryClient.setQueryData(getCurrentUserQueryOptions().queryKey, user);
      const languageName = getLanguageName(user.nativeLanguage || "");
      toast.success("Language preference saved", {
        description: `Your native language has been set to ${languageName}`,
      });
    },

    onError: () => {
      toast.error("Failed to save language preference");
    },
  });
}
