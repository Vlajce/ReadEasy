import { BookOpen, TrendingUp, Trophy, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/types/admin";
import { AdminStatCard } from "@/components/admin/admin-stat-card";

interface AdminStatGridProps {
  stats?: AdminStats;
  isLoading: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCompact(value: number) {
  return compactFormatter.format(value);
}

export function AdminStatGrid({ stats, isLoading }: AdminStatGridProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`admin-stat-skeleton-${index}`}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="mt-6 h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-4 h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const topBook = stats.topBooks[0];
  const topWord = stats.topWords[0];

  const cards = [
    {
      title: "Total Users",
      value: numberFormatter.format(stats.overview.totalUsers),
      description: "Active users on the platform",
      icon: <Users className="size-5" />,
      accent: "emerald" as const,
      badgeLabel: "Active",
    },
    {
      title: "Words Saved",
      value: formatCompact(stats.overview.totalWords),
      description: "Words saved by all users",
      icon: <BookOpen className="size-5" />,
      badgeLabel: "Library",
    },
    {
      title: "Most Read Book",
      value: formatCompact(topBook?.readerCount ?? 0),
      description: topBook ? topBook.title : "No data yet",
      icon: <TrendingUp className="size-5" />,
      badgeLabel: "Reading",
    },
    {
      title: "Most Saved Word",
      value: formatCompact(topWord?.userCount ?? 0),
      description: topWord ? topWord.baseForm : "No data yet",
      icon: <Trophy className="size-5" />,
      badgeLabel: "Saved by",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <AdminStatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
