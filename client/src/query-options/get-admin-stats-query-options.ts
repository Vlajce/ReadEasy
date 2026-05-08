import { apiClient } from "@/lib/api-client";
import type { AdminStats } from "@/types/admin";
import { queryOptions } from "@tanstack/react-query";

export function getAdminStatsQueryOptions() {
  return queryOptions({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStats>("/admin/stats"),
    staleTime: 60 * 1000,
  });
}
