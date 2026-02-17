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
import { getBookQueryOptions } from "@/query-options/get-book-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Book as BookIcon, TextAlignStart, UserRoundPen } from "lucide-react";
import { getEmoji, getLanguage, getName } from "language-flag-colors";
import { Badge } from "./ui/badge";
import { useUpdateReadingList } from "@/mutations/use-update-reading-list";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";

type BookDialogProps = React.ComponentProps<typeof Dialog> & {
  bookId: string;
};

export function BookDialog({ bookId, ...props }: BookDialogProps) {
  return (
    <Dialog {...props}>
      <Suspense fallback={<BookDialogContentSkeleton />}>
        <BookDialogContent bookId={bookId} />
      </Suspense>
    </Dialog>
  );
}

function BookDialogContent({ bookId }: { bookId: string }) {
  const { data: bookDetails } = useSuspenseQuery(getBookQueryOptions(bookId));
  const { mutate: addToReadingList } = useUpdateReadingList();

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
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="mr-6 text-lg">{bookDetails.title}</DialogTitle>
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
        <div className="no-scrollbar -mx-6 p-6 pr-7 text-justify max-h-[35vh] inset-shadow-lg/15 bg-accent overflow-y-auto">
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
          <div className="flex gap-2 items-center">
            <Button
              variant={"outline"}
              onClick={() => addToReadingList(bookDetails.id)}
            >
              <BookIcon />
              Read in Library
            </Button>
            <DialogClose asChild>
              <Button className="shadow-sm">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}

function BookDialogContentSkeleton() {
  return (
    <DialogContent>
      <DialogHeader>
        <Skeleton className="w-2/3 h-6 mb-2" />
        <div className="flex items-center justify-between gap-10">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/5 h-4" />
        </div>
      </DialogHeader>
      <div className="no-scrollbar -mx-6 p-6 pr-7 text-justify h-60 inset-shadow-lg/15 bg-accent overflow-y-auto"></div>
      <DialogFooter className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 -mt-2">
          <Skeleton className="w-16 h-4 rounded-full" />
          <Skeleton className="w-28 h-4 rounded-full" />
          <Skeleton className="w-40 h-4 rounded-full" />
          <Skeleton className="w-22 h-4 rounded-full" />
          <Skeleton className="w-28 h-4 rounded-full" />
          <Skeleton className="w-20 h-4 rounded-full" />
        </div>
        <div className="w-full flex justify-between items-center">
          <Skeleton className="w-11 h-9" />
          <div className="flex gap-2 items-center">
            <Skeleton className="w-32 h-9" />
            <DialogClose asChild>
              <Button className="shadow-sm">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
