import { apiClient } from "@/lib/api-client";
import { queryOptions } from "@tanstack/react-query";

export function getPublicBookContentQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["books", "public", id, "content"],
    queryFn: () => apiClient.getText(`/books/${id}/content`),
    staleTime: Infinity,
  });
}
