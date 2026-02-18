import { apiClient } from "@/lib/api-client";
import type { BookVocabularyWord } from "@/types/vocabulary";
import { queryOptions } from "@tanstack/react-query";

export function getBookVocabularyQueryOptions(bookId: string) {
  return queryOptions({
    queryKey: ["vocabulary", "books", bookId, "words"],
    queryFn: () =>
      apiClient.get<BookVocabularyWord[]>(`/vocabulary/books/${bookId}/words`),
    staleTime: 30_000,
  });
}
