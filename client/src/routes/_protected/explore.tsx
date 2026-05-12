import { BookList } from "@/components/ui/book-list";
import { BookListSkeleton } from "@/components/ui/book-list-skeleton";
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
import { Globe, Search, X } from "lucide-react";
import { Suspense, useCallback, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
// import { TopBooksSection } from "@/components/ui/top-books-section";

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

  const [inputValue, setInputValue] = useState(search || "");

  const triggerSearch = useCallback(
    (value: string) => {
      navigate({
        search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
      });
    },
    [navigate],
  );

  const debouncedSearch = useDebounce(triggerSearch, 300);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    debouncedSearch(e.target.value);
  }

  function handleClear() {
    setInputValue("");
    triggerSearch("");
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
        <div className="flex flex-1 gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="min-w-45 max-w-xs bg-accent/60 inset-shadow-md/10 shadow-none pl-9 pr-8"
            placeholder="Search"
            defaultValue={search || ""}
            onChange={handleInputChange}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Globe className="size-7" />
          <SelectLanguage
            handleApplyLanguageFilter={handleApplyLanguageFilter}
          />
        </div>
      </div>
      {/* <TopBooksSection /> */}
      {/* <div className="my-10 border-t border-border/70" /> */}
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
