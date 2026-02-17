import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "./carousel";
import type { ReadingBook } from "@/types/user";
import { BookCard } from "./book-card";
import { cn } from "@/lib/utils";

type BooksCarouselProps = React.ComponentProps<typeof Carousel> & {
  books: ReadingBook[];
  onBookCardClick?: (bookId: string) => void;
  onBookRemove?: (bookId: string) => void;
};

export function BooksCarousel({
  books,
  onBookCardClick,
  onBookRemove,
  className,
  ...props
}: BooksCarouselProps) {
  return (
    <Carousel
      className={cn("mt-4 max-w-2xl lg:max-w-4xl 2xl:max-w-6xl", className)}
      opts={{ align: "start", loop: true }}
      {...props}
    >
      <CarouselContent className="sm:-ml-8 sm:mr-3">
        {books.map((book) => (
          <CarouselItem
            key={book.id}
            className="basis-1/3 lg:basis-1/4 2xl:basis-1/5 pl-6 py-6"
          >
            <BookCard
              book={book}
              className="mx-auto"
              onClick={() => onBookCardClick?.(book.id)}
              onRemove={
                onBookRemove
                  ? (e) => {
                      e.stopPropagation();
                      onBookRemove(book.id);
                    }
                  : undefined
              }
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
