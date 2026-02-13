import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPublicBookQueryOptions } from "@/query-options/get-public-book-query-options";
import type { Book } from "@/types/book";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Book as BookIcon, TextAlignStart, UserRoundPen } from "lucide-react";
import { getEmoji, getLanguage, getName } from "language-flag-colors";
import { Badge } from "./ui/badge";

type BookDialogProps = React.ComponentProps<typeof Dialog> & {
  book: Book;
};

export function BookDialog({ book, ...props }: BookDialogProps) {
  const { data: bookDetails } = useSuspenseQuery(
    getPublicBookQueryOptions(book.id),
  );
  const countryName = getLanguage(bookDetails.language)?.country;
  const languageName = getName(bookDetails.language);

  // Split subjects that contain "--" and flatten
  const subjectsWithDulicates = bookDetails.subjects.flatMap((s) =>
    s.includes("--")
      ? s
          .split("--")
          .map((t) => t.trim())
          .filter(Boolean)
      : [s],
  );
  const subjects = Array.from(new Set(subjectsWithDulicates));

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mr-6 text-lg">
            {bookDetails.title}
          </DialogTitle>
          <DialogDescription className="italic -mb-2">
            <span className="flex items-center justify-between gap-10">
              <span className="flex items-center gap-2">
                <UserRoundPen size={18} />
                {bookDetails.author}
              </span>
              {countryName && languageName && (
                <span className="text-nowrap not-italic text-primary">
                  {getEmoji(countryName) + " " + languageName}
                </span>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>
        {bookDetails.description && (
          <div className="no-scrollbar -mx-6 p-6 pr-7 text-justify max-h-[35vh] inset-shadow-lg/15 bg-secondary overflow-y-auto">
            {bookDetails.description}
          </div>
        )}
        <DialogFooter className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 -mt-2">
            {subjects.map((subject, i) => (
              <Badge
                key={`${subject}-${i}`}
                variant={"secondary"}
                className="inset-shadow-md/10"
              >
                # {subject}
              </Badge>
            ))}
          </div>
          <div className="w-full flex justify-between items-center">
            {bookDetails.wordCount && (
              <p className="flex items-center gap-2">
                <TextAlignStart size={20} />
                {bookDetails.wordCount + " words"}
              </p>
            )}
            <div className="flex gap-2">
              <Link to="/library">
                <Button variant={"outline"}>
                  <BookIcon />
                  Read in Library
                </Button>
              </Link>
              <DialogClose asChild>
                <Button className="shadow-sm">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
