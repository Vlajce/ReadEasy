import { apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/types/admin";
import { queryOptions } from "@tanstack/react-query";

export function getAdminUsersQueryOptions() {
  return queryOptions({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get<AdminUser[]>("/admin/users"),
    staleTime: 30 * 1000,
  });
}
