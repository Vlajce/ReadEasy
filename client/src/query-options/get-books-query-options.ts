import { apiClient } from "@/lib/api-client";
import type { BookSearchParams } from "@/schemas/book";
import type { PaginatedBooks } from "@/types/book";

export function getBooksQueryOptions({
  page,
  limit,
  search,
  language,
  sortBy,
  sortOrder,
}: BookSearchParams) {
  return {
    queryKey: [
      "books",
      "public",
      { page, limit, search, language, sortBy, sortOrder },
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (language) params.append("language", language);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      return apiClient.get<PaginatedBooks>(`/books?${params.toString()}`);
    },
  };
}
