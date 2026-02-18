import { BookList } from "@/components/ui/book-list";
import { BookListSkeleton } from "@/components/ui/book-list-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBooksLanguagesQueryOptions } from "@/query-options/get-books-languages-query-options";
import { getBooksQueryOptions } from "@/query-options/get-books-query-options";
import { bookSearchSchema, type BookSearchParams } from "@/schemas/book";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getEmoji, getLanguage, getName } from "language-flag-colors";
import { Globe, Search } from "lucide-react";
import { Suspense } from "react";

export const Route = createFileRoute("/_protected/explore")({
  component: RouteComponent,
  validateSearch: bookSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    queryClient.ensureQueryData(getBooksQueryOptions(deps));
    queryClient.ensureQueryData(getBooksLanguagesQueryOptions());
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

  function handleApplyLanguageFilter(language: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        language: language === "all" ? undefined : language,
        page: 1,
      }),
    });
  }

  return (
    <div className="container mx-auto">
      <div className="mb-10 flex flex-wrap gap-4 justify-between items-center">
        <form className="flex flex-1 gap-2" onSubmit={handleSearch}>
          <Input
            className="min-w-45 max-w-xs bg-accent/60 inset-shadow-md/10"
            placeholder="Search"
            name="search"
            defaultValue={search || ""}
          />
          <Button type="submit" className="shadow-sm">
            <Search />
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Globe className="size-7" />
          <SelectLanguage
            handleApplyLanguageFilter={handleApplyLanguageFilter}
          />
        </div>
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
  } = useSuspenseQuery(getBooksQueryOptions({ ...searchParams }));

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

function SelectLanguage({
  handleApplyLanguageFilter,
}: {
  handleApplyLanguageFilter: (language: string) => void;
}) {
  const { language } = Route.useSearch();
  const { data: languages } = useSuspenseQuery(getBooksLanguagesQueryOptions());

  return (
    <Select value={language ?? "all"} onValueChange={handleApplyLanguageFilter}>
      <SelectTrigger className="w-full max-w-44">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Languages</SelectLabel>
          <SelectItem value="all">All languages</SelectItem>
          {languages?.map((language) => (
            <SelectItem key={language} value={language}>
              {getEmoji(getLanguage(language)?.country ?? "") +
                " " +
                getName(language)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
