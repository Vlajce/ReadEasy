import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPublicBookQueryOptions } from "@/query-options/get-public-book-query-options";
import type { Book } from "@/types/book";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

type BookDialogProps = React.ComponentProps<typeof Dialog> & {
  book: Book;
};

export function BookDialog({ book, ...props }: BookDialogProps) {
  const { data: bookDetails } = useSuspenseQuery(
    getPublicBookQueryOptions(book.id),
  );

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mr-10 text-lg">
            {bookDetails.title}
          </DialogTitle>
          <DialogDescription className="italic">
            {bookDetails.author.toLowerCase() === "unknown"
              ? ""
              : "-" + bookDetails.author}
          </DialogDescription>
        </DialogHeader>
        {bookDetails.description && (
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            {bookDetails.description}
          </div>
        )}
        <DialogFooter>
          <Link
            to="/library"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Read in Library
          </Link>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
