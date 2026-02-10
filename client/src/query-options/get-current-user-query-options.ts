import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";
import { queryOptions } from "@tanstack/react-query";

export function getCurrentUserQueryOptions() {
  return queryOptions({
    queryKey: ["users", "me"],
    queryFn: () => apiClient.get<User | null>("/users/me"),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
