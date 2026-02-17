import { apiClient } from "@/lib/api-client";
import { getFormattedDate } from "@/lib/utils";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";
import type { ReadingBook } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

export function useRemoveFromReadingList() {
  const { user } = useRouteContext({ from: "/_protected" });

  return useMutation({
    mutationFn: (bookId: string) =>
      apiClient.delete<ReadingBook[]>(`/users/me/reading-list/${bookId}`),

    onSuccess: async (data, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: getCurrentUserQueryOptions().queryKey,
      });
      user.readingBooks = data;

      toast.success("Book removed from your reading list", {
        description: getFormattedDate() + " 📆",
      });
    },
  });
}
