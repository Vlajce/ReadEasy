import { apiClient } from "@/lib/api-client";
import { queryOptions } from "@tanstack/react-query";

export function getBooksLanguagesQueryOptions() {
  return queryOptions({
    queryKey: ["books", "languages"],
    queryFn: () => apiClient.get<string[]>(`/books/languages`),
  });
}
