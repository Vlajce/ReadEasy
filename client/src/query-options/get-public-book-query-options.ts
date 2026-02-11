import { apiClient } from "@/lib/api-client";
import type { BookDetail } from "@/types/book";
import { queryOptions } from "@tanstack/react-query";

export function getPublicBookQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["books", "public", id],
    queryFn: () => apiClient.get<BookDetail>(`/books/${id}`),
  });
}
