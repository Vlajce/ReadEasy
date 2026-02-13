import { createFileRoute } from "@tanstack/react-router";
import { getPublicBookQueryOptions } from "@/query-options/get-public-book-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserRoundPen } from "lucide-react";
import { getEmoji, getLanguage, getName } from "language-flag-colors";

export const Route = createFileRoute("/_protected/library/$bookId")({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const { bookId } = params;
    queryClient.ensureQueryData(getPublicBookQueryOptions(bookId));
  },
});

function RouteComponent() {
  const { bookId } = Route.useParams();
  const { data: bookDetails } = useSuspenseQuery(
    getPublicBookQueryOptions(bookId),
  );

  const countryName = getLanguage(bookDetails.language)?.country;
  const languageName = getName(bookDetails.language);
  return (
    <div>
      <div className="mt-10 px-10 py-6">
        <div className="sm:w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold">{bookDetails.title}</h2>
          <p className="flex mt-2 gap-2 items-center justify-center text-muted-foreground">
            <UserRoundPen size={18} />
            {bookDetails.author}
            {countryName && languageName && (
              <span className="text-muted-foreground">
                {`(${getEmoji(countryName)} ${languageName})`}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="h-250"></div>
    </div>
  );
}
