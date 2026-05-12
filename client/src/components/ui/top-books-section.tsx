import { useSuspenseQuery } from "@tanstack/react-query";
import { getTopBooksQueryOptions } from "@/query-options/get-top-books-query-options";
import { BookCardSkeleton } from "@/components/ui/book-card-skeleton";
import { TopBooksCarousel } from "@/components/ui/top-books-carousel";
import { TrendingUp } from "lucide-react";
import { Suspense } from "react";

function TopBooksList() {
  const { data: topBooks } = useSuspenseQuery(getTopBooksQueryOptions());

  if (!topBooks.length) return null;

  return <TopBooksCarousel books={topBooks} />;
}

export function TopBooksSection() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="size-5" />
        <h2 className="text-lg font-semibold">Most Read</h2>
      </div>
      <Suspense
        fallback={
          <div className="flex gap-6 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <TopBooksList />
      </Suspense>
    </div>
  );
}
