import { apiClient } from "@/lib/api-client";
import type { TopBook } from "@/types/book";

export function getTopBooksQueryOptions() {
  return {
    queryKey: ["books", "top"],
    queryFn: () => apiClient.get<TopBook[]>("/books/top"),
  };
}
