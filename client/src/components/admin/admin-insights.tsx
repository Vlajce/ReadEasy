import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/types/admin";

interface AdminInsightsProps {
  stats?: AdminStats;
  isLoading: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export function AdminInsights({ stats, isLoading }: AdminInsightsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={`admin-insights-skeleton-${index}`} className="p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />
            <Skeleton className="mt-6 h-64 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const chartData = stats.topBooks.map((book) => ({
    name: book.title,
    readers: book.readerCount,
  }));
  const maxWordCount = stats.topWords[0]?.userCount ?? 1;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="rounded-3xl border-slate-200 p-6 shadow-sm">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold">
            Most Read Books
          </CardTitle>
          <CardDescription>
            Books currently being read by users.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="h-90">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--muted)/0.4)"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(value: number) => [
                    numberFormatter.format(value),
                    "Readers",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                />
                <Bar
                  dataKey="readers"
                  fill="#0f172a"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 p-6 shadow-sm">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold">
            Most Saved Words
          </CardTitle>
          <CardDescription>
            Words most frequently saved across all users.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="max-h-90 space-y-4 overflow-auto pr-2">
            {stats.topWords.map((item, index) => (
              <div
                key={`${item.baseForm}-${item.language}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {item.baseForm}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.translation}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {numberFormatter.format(item.userCount)}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Learners
                    </div>
                  </div>
                  <div className="h-9 w-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full w-full origin-bottom bg-slate-900"
                      style={{
                        height: `${Math.max(12, (item.userCount / maxWordCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
