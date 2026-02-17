import { BooksCarousel } from "@/components/ui/books-carousel";
import { Button } from "@/components/ui/button";
import { useRemoveFromReadingList } from "@/mutations/use-remove-from-reading-list";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";
import { CircleArrowDown, BookXIcon, Search } from "lucide-react";

export const Route = createFileRoute("/_protected/library")({
  component: RouteComponent,
  staticData: { title: "Library" },
});

function RouteComponent() {
  return (
    <div className="bg-secondary -my-10 -mx-4 sm:-mx-10">
      <div className="relative p-10 bg-background shadow-2xl/10">
        <div className="space-y-2">
          <h2 className="text-primary text-3xl font-semibold">
            Currently reading 📚
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Select a book to view details, continue reading, or manage your
            library.
          </p>
        </div>
        <BookCarouselSection />
      </div>
      <section id="book-content">
        <Outlet />
      </section>
    </div>
  );
}

function BookCarouselSection() {
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    user: { readingBooks },
  } = useRouteContext({ from: "/_protected" });
  const { mutate: removeFromReadingList } = useRemoveFromReadingList();

  const handleBookCardClick = (bookId: string) => {
    navigate({
      to: `${bookId}`,
      hash: "book-content",
      hashScrollIntoView: { block: "start", behavior: "smooth" },
    });
  };

  return readingBooks && readingBooks.length > 0 ? (
    <>
      <BooksCarousel
        books={readingBooks}
        onBookCardClick={handleBookCardClick}
        onBookRemove={removeFromReadingList}
        className="mb-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-5 text-primary scroll-fade-out"
      >
        <CircleArrowDown className="h-8 w-8 animate-bounce drop-shadow-lg" />
      </div>
    </>
  ) : (
    <div className="flex flex-col sm:w-[95%] max-w-6xl h-80 items-center justify-center space-y-1 bg-accent rounded-xl px-8 py-4 mt-6 border inset-shadow-xl/7">
      <div className="p-2.5 bg-accent text-secondary-foreground shadow-md rounded-lg mb-3">
        <BookXIcon size={25} />
      </div>
      <p className="text-xl font-medium text-secondary-foreground text-center">
        No books in your library yet
      </p>
      <p className="text-base text-muted-foreground mb-4 text-center">
        Find books to read in explore section and they will appear here.
      </p>
      <Link to="/explore">
        <Button>
          <Search />
          Go to Explore
        </Button>
      </Link>
    </div>
  );
}
