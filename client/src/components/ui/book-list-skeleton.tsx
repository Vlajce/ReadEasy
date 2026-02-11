import { BookCardSkeleton } from "./book-card-skeleton";

export function BookListSkeleton({ length }: { length: number }) {
  return (
    <div className="flex flex-wrap gap-20 justify-center 2xl:gap-24">
      {Array.from({ length }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}
