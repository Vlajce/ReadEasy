import { BookTextSkeleton } from "@/components/ui/book-text-skeleteon.";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/library/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-15 py-20 w-full mx-auto max-w-none">
      <h1 className="text-4xl font-extrabold mb-4">Select a book to read</h1>
      <Skeleton className="w-56 h-6 bg-muted-foreground/20" />
      <Skeleton className="w-44 mt-4 h-5 bg-muted-foreground/20" />
      <BookTextSkeleton className="mt-10" />
    </div>
  );
}
