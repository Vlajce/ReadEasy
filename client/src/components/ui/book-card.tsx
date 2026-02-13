import type { Book } from "@/types/book";
import { Image } from "./image";
import { cn } from "@/lib/utils";

type BookCardProps = React.ComponentProps<"div"> & {
  book: Book;
};

export function BookCard({ book, className, ...props }: BookCardProps) {
  const cleanTitle = book.title.replace(/[:;].*$/, "");
  return (
    <div
      className={cn(
        "w-44 max-h-100 overflow-hidden transition-transform duration-150 hover:-translate-y-1 hover:scale-105 cursor-pointer",
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden m-px h-64 rounded-md outline">
        <Image loading="lazy" src={book.imageUrl} alt={book.title} />
      </div>

      <h4 className="py-3 px-4 text-primary text-center text-base font-medium">
        <span>{cleanTitle}</span>
        <span className="mt-1.5 text-sm font-normal block italic">
          {book.author.toLowerCase() === "unknown" ? "" : `${book.author}`}
        </span>
      </h4>
    </div>
  );
}
