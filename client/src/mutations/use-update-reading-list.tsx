import { apiClient } from "@/lib/api-client";
import { getFormattedDate } from "@/lib/utils";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";
import type { ReadingBook } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

export function useUpdateReadingList() {
  const navigate = useNavigate();
  const { user } = useRouteContext({ from: "/_protected" });

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<ReadingBook[]>(`/users/me/reading-list/${id}`),

    onSuccess: async (data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: getCurrentUserQueryOptions().queryKey,
      });
      user.readingBooks = data;

      toast.success("You successfully added book to your reading list! 🎉", {
        description: getFormattedDate() + " 📆",
      });

      navigate({ to: `/library/${variables}` });
    },
  });
}
