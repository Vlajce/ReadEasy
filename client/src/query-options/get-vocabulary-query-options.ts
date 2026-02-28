import { apiClient } from "@/lib/api-client";
import type { VocabularySearchParams } from "@/schemas/vocabulary";
import type { PaginatedVocabularyEntries } from "@/types/vocabulary";
import { queryOptions } from "@tanstack/react-query";

export function getVocabularyQueryOptions({
  page,
  limit,
  search,
  language,
}: VocabularySearchParams) {
  return queryOptions({
    queryKey: ["vocabulary", "entries", { page, limit, search, language }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search?.trim()) params.append("search", search.trim());
      if (language) params.append("language", language);

      return apiClient.get<PaginatedVocabularyEntries>(
        `/vocabulary?${params.toString()}`,
      );
    },
    staleTime: 30_000,
  });
}