import { apiClient } from "@/lib/api-client";
import type { PaginatedVocabularyEntries } from "@/types/vocabulary";
import { infiniteQueryOptions } from "@tanstack/react-query";

type InfiniteVocabularyParams = {
  limit?: number;
  search?: string;
  language?: string;
};

export function getInfiniteVocabularyQueryOptions({
  limit = 20,
  search,
  language,
}: InfiniteVocabularyParams) {
  return infiniteQueryOptions({
    queryKey: ["vocabulary", "entries", "infinite", { limit, search, language }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      if (search?.trim()) params.append("search", search.trim());
      if (language) params.append("language", language);

      return apiClient.get<PaginatedVocabularyEntries>(
        `/vocabulary?${params.toString()}`,
      );
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}