import { apiClient } from "@/lib/api-client";
import type { AdminUserStats } from "@/types/admin";
import { queryOptions } from "@tanstack/react-query";

export function getAdminUserStatsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["admin", "users", userId, "stats"],
    queryFn: () =>
      apiClient.get<AdminUserStats>(`/admin/users/${userId}/stats`),
    staleTime: 30 * 1000,
  });
}
