import { apiClient } from "@/lib/api-client";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";
import type { BookDetail } from "@/types/book";
import type { ReadingBook } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";
import { Check } from "lucide-react";

export function useUpdateReadingList() {
  const navigate = useNavigate();
  const { user } = useRouteContext({ from: "/_protected" });

  return useMutation({
    mutationFn: (book: BookDetail) =>
      apiClient.post<ReadingBook[]>(`/users/me/reading-list/${book.id}`),

    onSuccess: async (data, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: getCurrentUserQueryOptions().queryKey,
      });
      user.readingBooks = data;

      toast(
        <div className="flex gap-3 max-w-none w-full text-[13px] justify-between items-center">
          <div className="flex gap-3 max-w-3/4 items-center">
            <Check
              className="bg-primary text-primary-foreground size-4 min-w-4 p-0.5 rounded-full"
              strokeWidth={3}
            />
            <div>
              <p className="font-medium">{variables.title}</p>
              <p className="font-light mt-0.5">Added to your reading list 📚</p>
            </div>
          </div>
          <div className="overflow-hidden m-px h-17 w-12 rounded-sm outline shadow-sm hover:shadow-md">
            <Image
              loading="lazy"
              src={variables.imageUrl}
              alt={variables.title}
            />
          </div>
        </div>,
      );

      navigate({ to: `/library/${variables.id}` });
    },
  });
}
