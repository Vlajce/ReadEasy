import type { Book } from "@/types/book";
import { cn } from "@/lib/utils";
import { Suspense, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { BookX } from "lucide-react";
import { BookCard } from "./book-card";
import { BookDialog } from "../book-dialog";

type BookListProps = React.ComponentProps<"div"> & {
  books: Book[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function BookList({
  books,
  emptyTitle,
  emptyDescription,
  className,
  ...props
}: BookListProps) {
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div
      className={cn(
        "flex flex-wrap gap-20 justify-center 2xl:gap-24",
        className,
      )}
      {...props}
    >
      {books.length === 0 ? (
        <Empty className="min-h-[50vh] my-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="shadow-sm">
              <BookX />
            </EmptyMedia>
            <EmptyTitle className="text-xl">
              {emptyTitle || "No books found"}
            </EmptyTitle>
            <EmptyDescription className="text-base text-muted-foreground">
              {emptyDescription ||
                "We couldn't find any books matching your criteria. Try adjusting your filters."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {books.map((book: Book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => {
                setSelectedBook(book);
                setOpen(true);
              }}
            />
          ))}
          {selectedBook && (
            <Suspense fallback={null}>
              <BookDialog
                book={selectedBook}
                open={open}
                onOpenChange={setOpen}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
