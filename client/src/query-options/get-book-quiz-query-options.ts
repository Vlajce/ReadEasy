import { apiClient } from "@/lib/api-client";
import { queryOptions } from "@tanstack/react-query";
import type { BookQuizDTO } from "@/types/vocabulary";

export function getBookQuizQueryOptions(bookId: string) {
  return queryOptions({
    queryKey: ["vocabulary", "books", bookId, "quiz"],
    queryFn: () =>
      apiClient.get<BookQuizDTO>(`/vocabulary/books/${bookId}/quiz`),
    staleTime: 0,
    gcTime: 0,
  });
}
