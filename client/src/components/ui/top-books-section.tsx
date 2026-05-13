import { useSuspenseQuery } from "@tanstack/react-query";
import { getTopBooksQueryOptions } from "@/query-options/get-top-books-query-options";
import { TopBooksCarousel } from "@/components/ui/top-books-carousel";
import { BookCardSkeleton } from "@/components/ui/book-card-skeleton";
import { TrendingUp } from "lucide-react";
import { Suspense } from "react";

function TopBooksList() {
  const { data: topBooks } = useSuspenseQuery(getTopBooksQueryOptions());

  if (!topBooks.length) return null;

  return <TopBooksCarousel books={topBooks} />;
}

export function TopBooksSection() {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-2xl font-semibold">Most Read</h2>
        <TrendingUp className="size-8" />
      </div>
      <p className="text-lg text-muted-foreground mb-2">
        Most popular books right now
      </p>
      <div className="pl-10">
        <Suspense
          fallback={
            <div className="flex gap-6 mt-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <TopBooksList />
        </Suspense>
      </div>
    </section>
  );
}
