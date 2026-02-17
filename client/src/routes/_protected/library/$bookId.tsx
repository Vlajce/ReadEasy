import { createFileRoute } from "@tanstack/react-router";
import { getBookContentQueryOptions } from "@/query-options/get-book-content-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";
import { BookTextSkeleton } from "@/components/ui/book-text-skeleteon.";
import { useMemo } from "react";
import {
  SelectionPopover,
  SelectionPopoverContent,
  SelectionPopoverTrigger,
  useSelectedText,
} from "@/components/ui/selection-popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/library/$bookId")({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const { bookId } = params;
    return queryClient.ensureQueryData(getBookContentQueryOptions(bookId));
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
  const { data: bookContent } = useSuspenseQuery(
    getBookContentQueryOptions(bookId),
  );

  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(bookContent, { FORBID_TAGS: ["img"] }),
    [bookContent],
  );

  return (
    <SelectionPopover>
      <SelectionPopoverTrigger>
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          className="p-15 py-20 mx-auto w-full prose text-justify max-w-none selection:text-muted selection:bg-primary"
        />
      </SelectionPopoverTrigger>
      <SelectionPopoverContent>
        <AddToVocabularyButton />
      </SelectionPopoverContent>
    </SelectionPopover>
  );
}

function AddToVocabularyButton() {
  const selectedText = useSelectedText();

  return (
    <Button onClick={() => toast.success(`Selected: "${selectedText}"`)}>
      Add to vocabulary
    </Button>
  );
}
