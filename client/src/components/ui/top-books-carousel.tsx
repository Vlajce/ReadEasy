import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import type { TopBook } from "@/types/book";
import { BookCard } from "./book-card";
import { BookDialog } from "../book-dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TopBooksCarouselProps = React.ComponentProps<typeof Carousel> & {
  books: TopBook[];
};

export function TopBooksCarousel({
  books,
  className,
  ...props
}: TopBooksCarouselProps) {
  const [open, setOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  return (
    <>
      <Carousel
        className={cn("mt-4 max-w-2xl lg:max-w-4xl 2xl:max-w-6xl", className)}
        opts={{ align: "start", loop: true }}
        {...props}
      >
        <CarouselContent className="-ml-6">
          {books.map((book) => (
            <CarouselItem
              key={book.id}
              className="basis-1/3 lg:basis-1/4 2xl:basis-1/5 pl-6 py-6"
            >
              <BookCard
                book={book}
                className="mx-auto"
                onClick={() => {
                  setSelectedBookId(book.id);
                  setOpen(true);
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>

      {selectedBookId && (
        <BookDialog
          bookId={selectedBookId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
