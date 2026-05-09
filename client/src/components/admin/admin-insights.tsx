import { BookOpen, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminStats } from "@/types/admin";
import { getLanguageName } from "@/lib/languages";

interface AdminInsightsProps {
  stats?: AdminStats;
  isLoading: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US");

// Podijum boje — gold, silver, bronze
const rankStyles = {
  badge: [
    "bg-amber-100 text-amber-600", // 🥇 gold
    "bg-slate-200 text-slate-600", // 🥈 silver
    "bg-orange-900/15 text-orange-900", // 🥉 bronze
  ],
  bar: [
    "bg-amber-500", // 🥇 gold
    "bg-slate-400", // 🥈 silver
    "bg-orange-800", // 🥉 bronze
  ],
  default: {
    badge: "bg-slate-100 text-slate-500",
    bar: "bg-slate-300",
  },
};

function getRankBadge(index: number) {
  return rankStyles.badge[index] ?? rankStyles.default.badge;
}

function getRankBar(index: number) {
  return rankStyles.bar[index] ?? rankStyles.default.bar;
}

export function AdminInsights({ stats, isLoading }: AdminInsightsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`admin-insights-skeleton-${index}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const maxReaderCount = stats.topBooks[0]?.readerCount ?? 1;
  const maxWordCount = stats.topWords[0]?.userCount ?? 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Most Read Books */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-slate-700" />
            <h3 className="text-xl font-semibold text-slate-900">
              Most Read Books
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Books currently being read by users.
          </p>
        </div>

        {stats.topBooks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
            <p className="text-sm italic text-slate-400">No data yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topBooks.map((book, index) => (
              <div
                key={book.id ?? book.title}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-slate-50"
              >
                {/* Rank */}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                    getRankBadge(index),
                  )}
                >
                  {index === 0 ? <Trophy className="size-4" /> : index + 1}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {book.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        getRankBar(index),
                      )}
                      style={{
                        width: `${Math.max(8, (book.readerCount / maxReaderCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-slate-900">
                    {numberFormatter.format(book.readerCount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Saved Words */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-slate-700" />
            <h3 className="text-xl font-semibold text-slate-900">
              Most Saved Words
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Words most frequently saved across all users.
          </p>
        </div>

        {stats.topWords.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
            <p className="text-sm italic text-slate-400">No data yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topWords.map((item, index) => (
              <div
                key={`${item.baseForm}-${item.language}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-slate-50"
              >
                {/* Rank */}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                    getRankBadge(index),
                  )}
                >
                  {index === 0 ? <Trophy className="size-4" /> : index + 1}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.baseForm}
                    </p>
                    <Badge
                      variant="outline"
                      className="rounded-full px-2 py-0 text-[10px]"
                    >
                      {getLanguageName(item.language)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.translation}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        getRankBar(index),
                      )}
                      style={{
                        width: `${Math.max(8, (item.userCount / maxWordCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-slate-900">
                    {numberFormatter.format(item.userCount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
