import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "./carousel";
import type { TopBook } from "@/types/book";
import { BookCard } from "./book-card";
import { cn } from "@/lib/utils";

type TopBooksCarouselProps = React.ComponentProps<typeof Carousel> & {
  books: TopBook[];
};

export function TopBooksCarousel({
  books,
  className,
  ...props
}: TopBooksCarouselProps) {
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
            <BookCard book={book} className="mx-auto" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
