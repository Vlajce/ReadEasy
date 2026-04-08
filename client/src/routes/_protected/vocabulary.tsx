import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getEmoji, getLanguage, getName } from "language-flag-colors";
import { Search, Trash2, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { VocabularyFilters } from "@/components/ui/vocabulary-filters";

import { vocabularySearchSchema } from "@/schemas/vocabulary";
import { getInfiniteVocabularyQueryOptions } from "@/query-options/get-infinite-vocabulary-query-options";
import { getVocabularyStatsQueryOptions } from "@/query-options/get-vocabulary-stats-query-options";
import { useDeleteVocabulary } from "@/mutations/use-delete-vocabulary";
import { useUpdateVocabularyStatus } from "@/mutations/use-update-vocabulary-status";
import type { HighlightColor, VocabularyStatus } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

const STATUS_ORDER: VocabularyStatus[] = ["new", "learning", "mastered"];
const ALL_STATUSES: VocabularyStatus[] = ["new", "learning", "mastered"];

export const Route = createFileRoute("/_protected/vocabulary")({
  component: RouteComponent,
  validateSearch: vocabularySearchSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    language: search.language,
  }),
  loader: async ({ context: { queryClient }, deps }) => {
    await Promise.all([
      queryClient.ensureInfiniteQueryData(
        getInfiniteVocabularyQueryOptions({
          limit: 20,
          search: deps.search,
          language: deps.language,
        }),
      ),
      queryClient.ensureQueryData(getVocabularyStatsQueryOptions()),
    ]);
  },
  staticData: {
    title: "Vocabulary",
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  const [statusFilter, setStatusFilter] = useState<"all" | VocabularyStatus>(
    "all",
  );
  const [colorFilter, setColorFilter] = useState<"all" | HighlightColor>("all");

  const statsQuery = useQuery(getVocabularyStatsQueryOptions());
  const { mutate: removeWord, isPending: isRemoving } = useDeleteVocabulary();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateVocabularyStatus();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = formData.get("search")?.toString().trim();
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  };

  const handleLanguageFilter = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        language: value === "all" ? undefined : value,
        page: 1,
      }),
    });
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setColorFilter("all");
    navigate({ search: (prev) => ({ ...prev, language: undefined, page: 1 }) });
  };

  if (statsQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading vocabulary…</div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Stats Bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">
          Total:{" "}
          {(statsQuery.data?.overview?.byStatus?.new ?? 0) +
            (statsQuery.data?.overview?.byStatus?.learning ?? 0) +
            (statsQuery.data?.overview?.byStatus?.mastered ?? 0)}
        </Badge>
        <Badge variant="outline">
          New: {statsQuery.data?.overview?.byStatus?.new ?? 0}
        </Badge>
        <Badge variant="outline">
          Learning: {statsQuery.data?.overview?.byStatus?.learning ?? 0}
        </Badge>
        <Badge variant="outline">
          Mastered: {statsQuery.data?.overview?.byStatus?.mastered ?? 0}
        </Badge>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            name="search"
            defaultValue={searchParams.search || ""}
            placeholder="Search by word..."
            className="max-w-xl bg-accent/60 inset-shadow-md/10"
          />
          <Button type="submit">
            <Search />
          </Button>
        </form>

        <VocabularyFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          languageFilter={searchParams.language ?? "all"}
          onLanguageChange={handleLanguageFilter}
          colorFilter={colorFilter}
          onColorChange={setColorFilter}
          onReset={handleResetFilters}
          availableLanguages={statsQuery.data?.byLanguage?.languages ?? []}
        />
      </div>

      {/* Content */}
      <VocabularyContainer
        search={searchParams.search}
        language={searchParams.language}
        statusFilter={statusFilter}
        colorFilter={colorFilter}
        onDelete={(id, word) => removeWord({ id, word })}
        onMove={(id, status) => updateStatus({ id, status })}
        isBusy={isRemoving || isUpdating}
      />
    </div>
  );
}

function VocabularyContainer({
  search,
  language,
  statusFilter,
  colorFilter,
  onDelete,
  onMove,
  isBusy,
}: {
  search: string | undefined;
  language: string | undefined;
  statusFilter: "all" | VocabularyStatus;
  colorFilter: "all" | HighlightColor;
  onDelete: (id: string, word: string) => void;
  onMove: (id: string, status: VocabularyStatus) => void;
  isBusy: boolean;
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const vocabularyQuery = useInfiniteQuery(
    getInfiniteVocabularyQueryOptions({ limit: 20, search, language }),
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          vocabularyQuery.hasNextPage &&
          !vocabularyQuery.isFetchingNextPage
        ) {
          vocabularyQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [vocabularyQuery]);

  const allPages = vocabularyQuery.data?.pages ?? [];
  const entries = allPages.flatMap((page) => page.data);

  const visibleEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const matchesLanguage =
        language === undefined ||
        language === "all" ||
        entry.language === language;
      const matchesColor =
        colorFilter === "all" || entry.highlightColor === colorFilter;
      return matchesStatus && matchesLanguage && matchesColor;
    });
  }, [entries, statusFilter, language, colorFilter]);

  const grouped = useMemo(
    () => ({
      new: visibleEntries.filter((e) => e.status === "new"),
      learning: visibleEntries.filter((e) => e.status === "learning"),
      mastered: visibleEntries.filter((e) => e.status === "mastered"),
    }),
    [visibleEntries],
  );

  const sectionsToRender =
    statusFilter === "all" ? STATUS_ORDER : [statusFilter];

  if (vocabularyQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading vocabulary…</div>
    );
  }

  return (
    <>
      {!visibleEntries.length ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No vocabulary words found</EmptyTitle>
            <EmptyDescription>
              Highlight unknown words while reading in Library and they'll show
              up here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      ) : (
        <div className="space-y-8">
          {sectionsToRender.map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {status === "new"
                    ? "New"
                    : status === "learning"
                      ? "Learning"
                      : "Mastered"}
                </h2>
                <Badge variant="secondary">{grouped[status].length}</Badge>
              </div>

              {!grouped[status].length ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No words in this section.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {grouped[status].map((entry) => (
                    <Card key={entry.id} size="sm" className="gap-4">
                      <CardHeader className="pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-3 rounded-full border vocab-highlight-swatch",
                                  `vocab-highlight-swatch-${entry.highlightColor}`,
                                )}
                              />
                              {entry.word}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {formatLanguage(entry.language)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{entry.status}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {entry.meaning || entry.context ? (
                          <>
                            {entry.meaning && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Translation:
                                </span>{" "}
                                {entry.meaning}
                              </p>
                            )}
                            {entry.context && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  Note:
                                </span>{" "}
                                {entry.context}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No translation or note added yet.
                          </p>
                        )}
                        <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                          <p className="font-medium">
                            {entry.bookSnapshot.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {entry.bookSnapshot.author}
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                        {ALL_STATUSES.map((status) => {
                          if (entry.status === status) return null;
                          return (
                            <Button
                              key={status}
                              size="xs"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => onMove(entry.id, status)}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          );
                        })}
                        <Button
                          size="xs"
                          variant="destructive"
                          className="ml-auto"
                          disabled={isBusy}
                          onClick={() => onDelete(entry.id, entry.word)}
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />
      {vocabularyQuery.isFetchingNextPage && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Loading more words…
        </div>
      )}
      {!vocabularyQuery.hasNextPage && entries.length > 0 && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          You've reached the end.
        </div>
      )}
    </>
  );
}

function formatLanguage(language: string) {
  const country = getLanguage(language)?.country ?? "";
  const emoji = country ? getEmoji(country) : "";
  const name = getName(language) || language.toUpperCase();
  return `${emoji ? `${emoji} ` : ""}${name}`;
}
