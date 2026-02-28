import { apiClient } from "@/lib/api-client";
import type { VocabularyStats } from "@/types/vocabulary";
import { queryOptions } from "@tanstack/react-query";

export function getVocabularyStatsQueryOptions() {
  return queryOptions({
    queryKey: ["vocabulary", "stats"],
    queryFn: () => apiClient.get<VocabularyStats>("/vocabulary/stats"),
    staleTime: 30_000,
  });
}