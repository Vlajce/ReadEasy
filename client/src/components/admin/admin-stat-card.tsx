import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  accent?: "emerald" | "slate";
  badgeLabel?: string;
}

const accentClasses: Record<
  NonNullable<AdminStatCardProps["accent"]>,
  string
> = {
  emerald: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

export function AdminStatCard({
  title,
  value,
  description,
  icon,
  accent = "slate",
  badgeLabel,
}: AdminStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-50 p-3 text-slate-700">{icon}</div>
        {badgeLabel ? (
          <Badge
            variant="outline"
            className={cn(
              "border-none text-[10px] font-semibold uppercase tracking-[0.2em]",
              accentClasses[accent],
            )}
          >
            {badgeLabel}
          </Badge>
        ) : null}
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
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-300 opacity-40" />
    </div>
  );
}
