import type { Book } from "@/types/book";
import { Image } from "./image";
import { cn } from "@/lib/utils";
import type { ReadingBook } from "@/types/user";
import { Plus } from "lucide-react";
import { Button } from "./button";

type BookCardProps = React.ComponentProps<"div"> & {
  book: Book | ReadingBook;
  onRemove?: (e: React.MouseEvent) => void;
};

export function BookCard({
  book,
  onRemove,
  className,
  ...props
}: BookCardProps) {
  const cleanTitle = book.title.replace(/[:;].*$/, "");
  return (
    <div
      className={cn(
        "relative w-44 max-h-100 overflow-visible transition-transform duration-150 hover:-translate-y-1 hover:scale-105 cursor-pointer",
        className,
      )}
      {...props}
    >
      {onRemove && (
        <Button
          className="absolute -top-2 -right-2 z-10 flex h-5 w-5 p-0 items-center justify-center bg-primary/60 rounded-full shadow-md hover:shadow-lg cursor-pointer"
          onClick={onRemove}
        >
          <Plus className="h-1 w-1 rotate-45" />
        </Button>
      )}
      <div className="overflow-hidden m-px h-64 rounded-md outline shadow-lg hover:shadow-xl">
        <Image loading="lazy" src={book.imageUrl} alt={book.title} />
      </div>

      <h4 className="py-3 px-4 text-primary text-center text-base font-medium">
        <span>{cleanTitle}</span>
        <span className="mt-1.5 text-sm font-normal block italic">
          {book.author}
        </span>
      </h4>
    </div>
  );
}
