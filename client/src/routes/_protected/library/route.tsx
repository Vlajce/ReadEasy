import { BooksCarousel } from "@/components/ui/books-carousel";
import type { Book } from "@/types/book";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CircleArrowDown } from "lucide-react";

export const Route = createFileRoute("/_protected/library")({
  component: RouteComponent,
  staticData: { title: "Library" },
});

function RouteComponent() {
  const [showArrow, setShowArrow] = useState(false);
  const books: Book[] = [
    {
      id: "698df407058337f0470072c7",
      title: "A List of Factorial Math Constants",
      author: "Unknown",
      language: "en",
      imageUrl:
        "https://www.gutenberg.org/cache/epub/212/pg212.cover.medium.jpg",
      wordCount: 12356,
    },
    {
      id: "698df407058337f0470072c3",
      title: "Collected Articles of Frederick Douglass",
      author: "Frederick Douglass",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/99/pg99.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df407058337f0470072c4",
      title:
        "Inaugural Address of Franklin Delano Roosevelt: Given in Washington, D.C. March 4th, 1933",
      author: "Franklin D. (Franklin Delano) Roosevelt",
      language: "en",
      imageUrl:
        "https://www.gutenberg.org/cache/epub/104/pg104.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df407058337f0470072c5",
      title: "The Ballad of Reading Gaol",
      author: "Oscar Wilde",
      language: "en",
      imageUrl:
        "https://www.gutenberg.org/cache/epub/301/pg301.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df407058337f0470072c6",
      title: "The Bucolics and Eclogues",
      author: "Virgil",
      language: "en",
      imageUrl:
        "https://www.gutenberg.org/cache/epub/230/pg230.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df402058337f0470072bd",
      title: "The Federalist Papers",
      author: "Alexander Hamilton",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/18/pg18.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df402058337f0470072be",
      title: "The Song of Hiawatha",
      author: "Henry Wadsworth Longfellow",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/19/pg19.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df402058337f0470072bf",
      title: "Paradise Lost",
      author: "John Milton",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/20/pg20.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df402058337f0470072c0",
      title:
        "Three hundred Aesop’s fables: Translated by George Fyler Townsend",
      author: "Aesop",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/21/pg21.cover.medium.jpg",
      wordCount: 12345,
    },
    {
      id: "698df402058337f0470072c1",
      title: "Roget's Thesaurus",
      author: "Peter Mark Roget",
      language: "en",
      imageUrl: "https://www.gutenberg.org/cache/epub/22/pg22.cover.medium.jpg",
      wordCount: 12345,
    },
  ];
  const navigate = useNavigate({ from: Route.fullPath });

  const handleBookClick = (bookId: string) => {
    setShowArrow(true);
    navigate({ to: `${bookId}` });
  };

  return (
    <div className="bg-secondary -my-10 -mx-4 sm:-mx-10">
      <div className="relative p-10 bg-background shadow-2xl/12">
        <div className="space-y-2">
          <h2 className="text-primary text-3xl sm:text-4xl font-semibold">
            Currently reading 📚
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Select a book to view details, continue reading, or manage your
            library.
          </p>
        </div>
        <BooksCarousel
          books={books}
          onBookCardClick={handleBookClick}
          className="mb-10"
        />
        {showArrow && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 bottom-5 text-primary scroll-fade-out"
          >
            <CircleArrowDown className="h-8 w-8 animate-bounce drop-shadow-lg" />
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
}
