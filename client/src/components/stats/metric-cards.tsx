import type { OverviewStats } from "@/types/vocabulary";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Flame, GraduationCap, Trophy } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardsProps {
  overview: OverviewStats;
}

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  badgeLabel: string;
  accent?: "emerald" | "blue" | "amber" | "indigo" | "slate";
}

const accentClasses: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-orange-50 text-orange-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
};

function MetricCard({
  title,
  value,
  description,
  icon,
  badgeLabel,
  accent = "slate",
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("rounded-2xl p-3", accentClasses[accent])}>
          {icon}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "border-none text-[10px] font-semibold uppercase tracking-[0.2em]",
            accentClasses[accent],
          )}
        >
          {badgeLabel}
        </Badge>
      </div>
      <div className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-linear-to-r from-slate-200 to-slate-300 opacity-40" />
    </div>
  );
}

export function MetricCards({ overview }: MetricCardsProps) {
  const totalWords =
    overview.byStatus.new +
    overview.byStatus.learning +
    overview.byStatus.mastered;

  const metrics: MetricCardProps[] = [
    {
      title: "Total Words",
      value: totalWords,
      description: "Across all books",
      icon: <BookOpen className="size-5" />,
      badgeLabel: "Library",
      accent: "blue",
    },
    {
      title: "This Week",
      value: overview.wordsAdded.thisWeek,
      description: "New words saved",
      icon: <Flame className="size-5" />,
      badgeLabel: "Recent",
      accent: "amber",
    },
    {
      title: "Reviewed",
      value: overview.byStatus.learning + overview.byStatus.mastered,
      description: "Practiced at least once",
      icon: <GraduationCap className="size-5" />,
      badgeLabel: "Progress",
      accent: "indigo",
    },
    {
      title: "Mastered",
      value: overview.byStatus.mastered,
      description: "Fully learned words",
      icon: <Trophy className="size-5" />,
      badgeLabel: "Mastered",
      accent: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
