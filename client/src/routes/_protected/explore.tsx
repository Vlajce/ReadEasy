import { getPublicBooksQueryOptions } from "@/query-options/get-public-books-query-options";
import { bookSearchSchema } from "@/schemas/book";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/explore")({
  component: RouteComponent,
  validateSearch: bookSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    queryClient.ensureQueryData(getPublicBooksQueryOptions(deps));
  },
  staticData: { title: "Explore" },
});

function RouteComponent() {
  return <div>Hello "/_protected/explore"!</div>;
}
