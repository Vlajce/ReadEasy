import { createFileRoute } from "@tanstack/react-router";
import { getBookContentQueryOptions } from "@/query-options/get-book-content-query-options";
import { getBookQueryOptions } from "@/query-options/get-book-query-options";
import { getBookVocabularyQueryOptions } from "@/query-options/get-book-vocabulary-query-options";
import { useSuspenseQueries } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";
import { BookTextSkeleton } from "@/components/ui/book-text-skeleteon.";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SelectionPopover,
  SelectionPopoverContent,
  SelectionPopoverTrigger,
  useSelectedText,
  useSelectionPopoverClose,
} from "@/components/ui/selection-popover";
import { Button } from "@/components/ui/button";
import { useAddVocabulary } from "@/mutations/use-add-vocabulary";
import { highlightVocabularyWords, type HighlightWord } from "@/lib/highlight";
import type { HighlightColor } from "@/types/vocabulary";
import { cn } from "@/lib/utils";
import type { BookDetail } from "@/types/book";
import { ArrowUp } from "lucide-react";

const HIGHLIGHT_COLORS: { value: HighlightColor; label: string }[] = [
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
];

export const Route = createFileRoute("/_protected/library/$bookId")({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const { bookId } = params;
    await Promise.all([
      queryClient.ensureQueryData(getBookContentQueryOptions(bookId)),
      queryClient.ensureQueryData(getBookQueryOptions(bookId)),
      queryClient.ensureQueryData(getBookVocabularyQueryOptions(bookId)),
    ]);
  },
  pendingComponent: () => (
    <div className="px-15 py-20 w-full mx-auto max-w-none">
      <Skeleton className="w-80 h-8 bg-muted-foreground/20" />
      <Skeleton className="w-56 mt-6 h-6 bg-muted-foreground/20" />
      <Skeleton className="w-44 mt-4 h-5 bg-muted-foreground/20" />
      <BookTextSkeleton className="mt-10" />
    </div>
  ),
});

function RouteComponent() {
  const { bookId } = Route.useParams();
  const [{ data: book }, { data: bookContent }, { data: vocabWords }] =
    useSuspenseQueries({
      queries: [
        getBookQueryOptions(bookId),
        getBookContentQueryOptions(bookId),
        getBookVocabularyQueryOptions(bookId),
      ],
    });

  const contentRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(bookContent, { FORBID_TAGS: ["img"] }),
    [bookContent],
  );

  // Apply highlights whenever the HTML or vocabulary words change
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    el.innerHTML = sanitizedHtml;

    if (vocabWords?.length) {
      highlightVocabularyWords(el, vocabWords as HighlightWord[]);
    }
  }, [sanitizedHtml, vocabWords]);

  return (
    <>
      <SelectionPopover>
        <SelectionPopoverTrigger>
          <div
            ref={contentRef}
            className="p-15 py-20 mx-auto w-full prose text-justify max-w-none selection:text-muted selection:bg-primary"
          />
        </SelectionPopoverTrigger>
        <SelectionPopoverContent>
          <AddToVocabularyButton book={book} />
        </SelectionPopoverContent>
      </SelectionPopover>

      <Button
        type="button"
        size="icon"
        className="fixed right-6 bottom-6 z-50 rounded-full shadow-lg"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp />
      </Button>
    </>
  );
}

function AddToVocabularyButton({ book }: { book: BookDetail }) {
  const selectedText = useSelectedText();
  const closePopover = useSelectionPopoverClose();
  const { mutate: addVocabulary, isPending } = useAddVocabulary();
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("yellow");

  const handleAdd = () => {
    if (!selectedText.trim()) return;

    addVocabulary({
      word: selectedText,
      bookId: book.id,
      language: book.language,
      highlightColor: selectedColor,
    });

    closePopover();
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 px-1">
        {HIGHLIGHT_COLORS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            title={label}
            onClick={() => setSelectedColor(value)}
            className={cn(
              "size-5 rounded-full transition-all border-2 vocab-highlight-swatch",
              `vocab-highlight-swatch-${value}`,
              selectedColor === value
                ? "border-foreground scale-110"
                : "border-transparent opacity-60 hover:opacity-100",
            )}
          />
        ))}
      </div>
      <div className="w-px h-5 bg-border" />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleAdd}
        disabled={isPending || !selectedText.trim()}
        className="text-xs font-medium"
      >
        Add to vocabulary
      </Button>
    </div>
  );
}
