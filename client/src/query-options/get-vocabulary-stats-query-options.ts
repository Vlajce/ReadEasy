import { apiClient } from "@/lib/api-client";
import type { StatsResponse } from "@/types/vocabulary";
import { queryOptions } from "@tanstack/react-query";

export function getVocabularyStatsQueryOptions(days: number = 30) {
  return queryOptions({
    queryKey: ["vocabulary", "stats", days],
    queryFn: () =>
      apiClient.get<StatsResponse>(`/vocabulary/stats?days=${days}`),
    staleTime: 30_000,
  });
}
