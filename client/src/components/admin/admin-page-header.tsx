export type AdminTimeRange = "24h" | "7d" | "30d";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  range: AdminTimeRange;
  onRangeChange: (range: AdminTimeRange) => void;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </header>
  );
}
