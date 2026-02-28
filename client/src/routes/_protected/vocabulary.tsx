import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getEmoji, getLanguage, getName } from "language-flag-colors";
import { Search, Trash2, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInfiniteVocabularyQueryOptions } from "@/query-options/get-infinite-vocabulary-query-options";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { vocabularySearchSchema } from "@/schemas/vocabulary";
import { getVocabularyStatsQueryOptions } from "@/query-options/get-vocabulary-stats-query-options";
import { useDeleteVocabulary } from "@/mutations/use-delete-vocabulary";
import { useUpdateVocabularyStatus } from "@/mutations/use-update-vocabulary-status";
import type {
  HighlightColor,
  VocabularyEntry,
  VocabularyStatus,
} from "@/types/vocabulary";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS: Array<{ value: "all" | HighlightColor; label: string }> = [
  { value: "all", label: "All colors" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
];

const STATUS_OPTIONS: Array<{
  value: "all" | VocabularyStatus;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
];

const STATUS_ORDER: VocabularyStatus[] = ["new", "learning", "mastered"];

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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const initialLanguage = searchParams.language ?? "all";

  const [statusFilter, setStatusFilter] = useState<"all" | VocabularyStatus>(
    "all",
  );
  const [languageFilter, setLanguageFilter] = useState<string>(initialLanguage);
  const [colorFilter, setColorFilter] = useState<"all" | HighlightColor>("all");

  const vocabularyQuery = useInfiniteQuery(
    getInfiniteVocabularyQueryOptions({
      limit: 20,
      search: searchParams.search,
      language: searchParams.language,
    }),
  );

  const statsQuery = useQuery(getVocabularyStatsQueryOptions());

  const { mutate: removeWord, isPending: isRemoving } = useDeleteVocabulary();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateVocabularyStatus();

  useEffect(() => {
    setLanguageFilter(searchParams.language ?? "all");
  }, [searchParams.language]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        const first = observerEntries[0];

        if (
          first?.isIntersecting &&
          vocabularyQuery.hasNextPage &&
          !vocabularyQuery.isFetchingNextPage
        ) {
          vocabularyQuery.fetchNextPage();
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    vocabularyQuery.hasNextPage,
    vocabularyQuery.isFetchingNextPage,
    vocabularyQuery.fetchNextPage,
  ]);

  const allPages = vocabularyQuery.data?.pages ?? [];
  const entries = allPages.flatMap((page) => page.data);
  const stats = statsQuery.data;

  const visibleEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" ? true : entry.status === statusFilter;

      const matchesLanguage =
        languageFilter === "all" ? true : entry.language === languageFilter;

      const matchesColor =
        colorFilter === "all" ? true : entry.highlightColor === colorFilter;

      return matchesStatus && matchesLanguage && matchesColor;
    });
  }, [entries, statusFilter, languageFilter, colorFilter]);

  const grouped = useMemo(() => {
    return {
      new: visibleEntries.filter((entry) => entry.status === "new"),
      learning: visibleEntries.filter((entry) => entry.status === "learning"),
      mastered: visibleEntries.filter((entry) => entry.status === "mastered"),
    };
  }, [visibleEntries]);

  const sectionsToRender =
    statusFilter === "all" ? STATUS_ORDER : [statusFilter];

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = formData.get("search")?.toString().trim();

    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    });
  }

  function resetFilters() {
    setStatusFilter("all");
    setLanguageFilter("all");
    setColorFilter("all");

    navigate({
      search: (prev) => ({
        ...prev,
        language: undefined,
        page: 1,
      }),
    });
  }

  const totalWords =
    (stats?.byStatus.new ?? 0) +
    (stats?.byStatus.learning ?? 0) +
    (stats?.byStatus.mastered ?? 0);

  if (vocabularyQuery.isPending || statsQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading vocabulary…</div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">Total: {totalWords}</Badge>
        <Badge variant="outline">New: {stats?.byStatus.new ?? 0}</Badge>
        <Badge variant="outline">
          Learning: {stats?.byStatus.learning ?? 0}
        </Badge>
        <Badge variant="outline">
          Mastered: {stats?.byStatus.mastered ?? 0}
        </Badge>
      </div>

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

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">Filters</h3>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | VocabularyStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Language
              </p>
              <Select
                value={languageFilter}
                onValueChange={(value) => {
                  setLanguageFilter(value);

                  navigate({
                    search: (prev) => ({
                      ...prev,
                      language: value === "all" ? undefined : value,
                      page: 1,
                    }),
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    <SelectItem value="all">All languages</SelectItem>
                    {Object.keys(stats?.byLanguage ?? {})
                      .sort()
                      .map((language) => (
                        <SelectItem key={language} value={language}>
                          {formatLanguage(language)}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Highlight color
              </p>
              <Select
                value={colorFilter}
                onValueChange={(value) =>
                  setColorFilter(value as "all" | HighlightColor)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Highlight color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Highlight color</SelectLabel>
                    {COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              Reset filters
            </Button>
          </div>
        </div>
      </div>

      {!visibleEntries.length ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No vocabulary words found</EmptyTitle>
            <EmptyDescription>
              Highlight unknown words while reading in Library and they’ll show
              up here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      ) : (
        <div className="space-y-8">
          {sectionsToRender.map((status) => (
            <VocabularySection
              key={status}
              title={getSectionTitle(status)}
              entries={grouped[status]}
              onDelete={(entry) =>
                removeWord({ id: entry.id, word: entry.word })
              }
              onMove={(entry, nextStatus) =>
                updateStatus({ id: entry.id, status: nextStatus })
              }
              isBusy={isRemoving || isUpdating}
            />
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
          You’ve reached the end.
        </div>
      )}
    </div>
  );
}

function VocabularySection({
  title,
  entries,
  onDelete,
  onMove,
  isBusy,
}: {
  title: string;
  entries: VocabularyEntry[];
  onDelete: (entry: VocabularyEntry) => void;
  onMove: (entry: VocabularyEntry, status: VocabularyStatus) => void;
  isBusy: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{entries.length}</Badge>
      </div>

      {!entries.length ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No words in this section.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {entries.map((entry) => (
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
                {entry.meaning ? (
                  <p className="text-sm">
                    <span className="font-medium">Translation:</span>{" "}
                    {entry.meaning}
                  </p>
                ) : null}

                {entry.context ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note:</span>{" "}
                    {entry.context}
                  </p>
                ) : null}

                {!entry.meaning && !entry.context ? (
                  <p className="text-sm text-muted-foreground italic">
                    No translation or note added yet.
                  </p>
                ) : null}

                <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <p className="font-medium">{entry.bookSnapshot.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {entry.bookSnapshot.author}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                {entry.status !== "new" && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => onMove(entry, "new")}
                  >
                    New
                  </Button>
                )}

                {entry.status !== "learning" && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => onMove(entry, "learning")}
                  >
                    Learning
                  </Button>
                )}

                {entry.status !== "mastered" && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => onMove(entry, "mastered")}
                  >
                    Mastered
                  </Button>
                )}

                <Button
                  size="xs"
                  variant="destructive"
                  className="ml-auto"
                  disabled={isBusy}
                  onClick={() => onDelete(entry)}
                >
                  <Trash2 />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function getSectionTitle(status: VocabularyStatus) {
  if (status === "new") return "New";
  if (status === "learning") return "Learning";
  return "Mastered";
}

function formatLanguage(language: string) {
  const country = getLanguage(language)?.country ?? "";
  const emoji = country ? getEmoji(country) : "";
  const name = getName(language) || language.toUpperCase();
  return `${emoji ? `${emoji} ` : ""}${name}`;
}
