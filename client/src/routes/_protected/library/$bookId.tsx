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
import { Input } from "@/components/ui/input";
import { highlightVocabularyWords, type HighlightWord } from "@/lib/highlight";
import type { HighlightColor } from "@/types/vocabulary";
import { cn } from "@/lib/utils";
import type { BookDetail } from "@/types/book";
import { ArrowUp } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@/mutations/use-translate";
import { useSaveVocabulary } from "@/mutations/use-save-vocabulary";
import { extractSentence } from "@/lib/extract-sentence";
import type { TranslationResult } from "@/types/vocabulary";

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
        <SelectionPopoverContent className="p-1 bg-accent">
          <PopoverWrapper book={book} />
        </SelectionPopoverContent>
      </SelectionPopover>

      <Button
        type="button"
        size="icon"
        className="fixed right-6 bottom-6 z-50 rounded-full shadow-xl"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp />
      </Button>
    </>
  );
}

function PopoverWrapper({ book }: { book: BookDetail }) {
  const selectedText = useSelectedText();
  return <Popover key={selectedText} book={book} />;
}

type PopoverState = "idle" | "loading" | "translated" | "saved" | "error";

function Popover({ book }: { book: BookDetail }) {
  const selectedText = useSelectedText();
  const closePopover = useSelectionPopoverClose();
  const { mutate: translate } = useTranslate();
  const { mutate: saveVocabulary, isPending: isSaving } = useSaveVocabulary();

  const { data: vocabWords } = useQuery(getBookVocabularyQueryOptions(book.id));

  const savedEntry = useMemo(() => {
    if (!selectedText || !vocabWords) return null;
    return (
      vocabWords.find((w) => w.word === selectedText.trim().toLowerCase()) ??
      null
    );
  }, [selectedText, vocabWords]);

  const [state, setState] = useState<PopoverState>(
    savedEntry ? "saved" : "idle",
  );
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [editedTranslation, setEditedTranslation] = useState("");
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("yellow");
  const [extractedSentence, setExtractedSentence] = useState<string>("");

  const popoverWidthClass =
    state === "translated" ? "w-72" : state === "saved" ? "w-68" : "w-48";

  const handleTranslate = () => {
    if (!selectedText.trim()) return;

    setState("loading");

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;

    // Za AI translation — šalji sa kontekstom (3 rečenice)
    const fullSentence = anchorNode
      ? extractSentence(anchorNode, selectedText.trim(), true)
      : selectedText;

    // Za contexts u bazi — čuvaj samo ciljnu rečenicu
    const contextSentence = anchorNode
      ? extractSentence(anchorNode, selectedText.trim(), false)
      : selectedText;

    setExtractedSentence(contextSentence);

    translate(
      {
        word: selectedText.trim(),
        sentence: fullSentence, // OpenAI dobija ceo paragraf
        bookId: book.id,
      },
      {
        onSuccess: (result) => {
          setTranslationResult(result);
          setEditedTranslation(result.translation);
          setState("translated");
        },
        onError: () => {
          setState("error");
        },
      },
    );
  };

  const handleSave = () => {
    if (!translationResult || !selectedText.trim()) return;

    saveVocabulary(
      {
        word: selectedText.trim(),
        bookId: book.id,
        sentence: extractedSentence,
        translation: editedTranslation,
        baseForm: translationResult.baseForm,
        partOfSpeech: translationResult.partOfSpeech,
        exampleSentence: translationResult.exampleSentence,
        highlightColor: selectedColor,
      },
      {
        onSuccess: () => {
          closePopover();
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-2 transition-[width] duration-200",
        popoverWidthClass,
      )}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Selected word</p>
        <p className="text-base font-semibold text-wrap" title={selectedText}>
          &ldquo;{selectedText}&rdquo;
        </p>
      </div>

      {state === "idle" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleTranslate}
          className="text-sm font-medium hover:bg-muted-foreground/10"
        >
          Translate
        </Button>
      )}

      {state === "loading" && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-2 py-1">
          <p className="text-xs text-destructive text-center">
            Translation failed. Please try again.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTranslate}
            className="text-xs font-medium hover:bg-muted-foreground/10"
          >
            Try again
          </Button>
        </div>
      )}

      {state === "translated" && translationResult && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Translation</p>
              <Input
                value={editedTranslation}
                onChange={(e) => setEditedTranslation(e.target.value)}
                className="h-8 text-sm md:text-sm p-1.5 pt-1 bg-muted-foreground/5 inset-shadow-sm shadow-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Base form</p>
              <p className="text-sm font-medium">
                {translationResult.baseForm}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Part of speech</p>
              <p className="text-sm font-medium">
                {translationResult.partOfSpeech}
              </p>
            </div>
            {translationResult.exampleSentence && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Example</p>
                <p className="text-sm italic text-foreground/80">
                  &ldquo;{translationResult.exampleSentence}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex shrink-0 items-center gap-1">
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
            <div className="h-6 shrink-0 border-l border-foreground/20" />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving || !editedTranslation.trim()}
              className="ml-0.5 shrink-0 text-sm font-medium hover:bg-muted-foreground/10"
            >
              {isSaving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Save to vocabulary"
              )}
            </Button>
          </div>
        </>
      )}

      {state === "saved" && savedEntry && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Translation</p>
              <p className="text-sm font-medium">{savedEntry.translation}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Base form</p>
              <p className="text-sm font-medium">{savedEntry.baseForm}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Part of speech</p>
              <p className="text-sm font-medium">{savedEntry.partOfSpeech}</p>
            </div>
            {savedEntry.exampleSentence && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Example</p>
                <p className="text-sm italic text-foreground/80">
                  &ldquo;{savedEntry.exampleSentence}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex shrink-0 items-center gap-1.5 ">
              <div
                className={cn(
                  "size-2 rounded-full vocab-highlight-swatch",
                  `vocab-highlight-swatch-${savedEntry.highlightColor}`,
                )}
              />
              <p className="text-sm text-muted-foreground">Already saved</p>
            </div>
            <div className="h-6 shrink-0 border-l border-foreground/20" />
            <Button
              size="sm"
              variant="ghost"
              className="ml-0.5 shrink-0 text-sm font-medium hover:bg-muted-foreground/10"
              asChild
            >
              <Link to="/vocabulary">View in vocabulary</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
