import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "./carousel";
import type { Book } from "@/types/book";
import { BookCard } from "./book-card";

export function BooksCarousel({ books }: { books: Book[] }) {
  return (
    <Carousel
      className="sm:w-[95%] max-w-4xl"
      opts={{ align: "start", loop: true }}
    >
      <CarouselContent className="-ml-8 sm:mr-3">
        {books.map((book) => (
          <CarouselItem
            key={book.id}
            className="basis-1/2 sm:basis-1/3 lg:basis-1/4 2xl:basis-1/5 pl-4 py-4"
          >
            <BookCard book={book} className="mx-auto" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
