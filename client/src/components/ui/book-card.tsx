import type { Book } from "@/types/book";
import { Image } from "./image";

type BookCardProps = React.ComponentProps<"div"> & {
  book: Book;
};

export function BookCard({ book, ...props }: BookCardProps) {
  const cleanTitle = book.title.replace(/[:;].*$/, "");
  return (
    <div
      className="w-44 max-h-96 overflow-hidden transition-transform duration-150 hover:-translate-y-1 cursor-pointer"
      {...props}
    >
      <div className="overflow-hidden h-60 rounded-md">
        <Image
          loading="lazy"
          //className="scale-y-105 scale-x-110"
          src={book.imageUrl}
          alt={book.title}
        />
      </div>

      <h4 className="py-3 px-4 text-primary text-center text-base font-medium ">
        <span>{cleanTitle}</span>
        <span className="mt-1.5 text-sm font-normal block italic">
          {book.author.toLowerCase() === "unknown" ? "" : `${book.author}`}
        </span>
      </h4>
    </div>
  );
}
