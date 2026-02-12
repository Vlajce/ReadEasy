import { BookList } from "@/components/ui/book-list";
import { BookListSkeleton } from "@/components/ui/book-list-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getPublicBooksQueryOptions } from "@/query-options/get-public-books-query-options";
import { bookSearchSchema, type BookSearchParams } from "@/schemas/book";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Suspense } from "react";

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
  const navigate = useNavigate({ from: Route.fullPath });
  const { search, limit, ...rest } = Route.useSearch();

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search")?.toString() || "";
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchValue,
        page: 1,
      }),
    });
  }
  return (
    <div className="container mx-auto">
      <div className="mb-10 flex flex-wrap gap-4 justify-between items-center">
        <form className="flex flex-1 gap-2" onSubmit={handleSearch}>
          <Input
            className="min-w-45 max-w-sm bg-accent/70 inset-shadow-md/15"
            placeholder="Search"
            name="search"
            defaultValue={search || ""}
          />
          <Button type="submit" className="shadow-sm">
            <Search />
          </Button>
        </form>
      </div>
      <Suspense fallback={<BookListSkeleton length={limit} />}>
        <BooksContainer search={search} limit={limit} {...rest} />
      </Suspense>
    </div>
  );
}

function BooksContainer(searchParams: BookSearchParams) {
  const {
    data: {
      data: books,
      meta: { totalPages },
    },
  } = useSuspenseQuery(getPublicBooksQueryOptions({ ...searchParams }));

  return (
    <>
      <BookList books={books} />
      <Pagination
        routePath={Route.fullPath}
        page={searchParams.page}
        totalPageCount={totalPages}
      />
    </>
  );
}
